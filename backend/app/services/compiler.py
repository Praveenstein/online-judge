"""Module for executing code snippets in various programming languages.

This module provides a CodeExecutor class that manages temporary file
creation, subprocess execution, and cleanup for Python, C++, and Go.
"""

# Built-In Imports.
import subprocess
import uuid
import os
from pathlib import Path
from typing import Dict, Any, Callable, Awaitable

BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
TEMP_DIR: Path = BASE_DIR / "temp_code"

# Ensure it exists
TEMP_DIR.mkdir(parents=True, exist_ok=True)


import asyncio
import psutil
import time

async def execute_with_limits(cmd: list[str], input_data: str, timeout: int = 5, max_memory_mb: int = 250, shell: bool = False) -> Dict[str, Any]:
    """Runs a command with timeout and memory limits asynchronously using Popen.
    
    Args:
        cmd: The command to execute.
        input_data: The input string for stdin.
        timeout: Maximum execution time in seconds.
        max_memory_mb: Maximum allowed memory in MB.
        
    Returns:
        A dictionary containing stdout, stderr, and exit_code.
    """
    try:
        # Run process non-blocking using the standard subprocess module
        if shell:
            cmd_str = " ".join(cmd)
            process = subprocess.Popen(
                cmd_str,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env={**os.environ, "PYTHONIOENCODING": "utf-8"},
                shell=True
            )
        else:
            process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env={**os.environ, "PYTHONIOENCODING": "utf-8"}
            )
    except Exception as e:
        return {"stdout": "", "stderr": f"Failed to start process: {repr(e)}", "exit_code": 1}
        
    max_memory_bytes = max_memory_mb * 1024 * 1024
    start_time = time.time()
    
    # Write input explicitly if present, then close stdin
    if input_data and process.stdin:
        try:
            process.stdin.write(input_data.encode('utf-8'))
            process.stdin.flush()
        except OSError:
            pass
    if process.stdin:
        process.stdin.close()
        
    limit_reason = None
        
    # Asynchronously poll for the process to finish
    while process.poll() is None:
        try:
            p = psutil.Process(process.pid)
            # Sum memory of process and its children
            current_mem = p.memory_info().rss
            children = p.children(recursive=True)
            for child in children:
                try:
                    current_mem += child.memory_info().rss
                except psutil.NoSuchProcess:
                    pass
                    
            if current_mem > max_memory_bytes:
                # Force kill all children first, then parent
                for child in children:
                    try:
                        child.kill()
                    except psutil.NoSuchProcess:
                        pass
                process.kill()
                limit_reason = "Memory Limit Exceeded"
                break
                
        except psutil.NoSuchProcess:
            break
            
        if time.time() - start_time > timeout:
            try:
                # Same for time limit, kill children to prevent zombies on Linux
                p = psutil.Process(process.pid)
                for child in p.children(recursive=True):
                    try:
                        child.kill()
                    except psutil.NoSuchProcess:
                        pass
                process.kill()
            except (OSError, psutil.NoSuchProcess):
                pass
            limit_reason = "Time Limit Exceeded"
            break
            
        await asyncio.sleep(0.05)  # Poll every 50ms

    # Collect the outputs
    stdout_data, stderr_data = b"", b""
    try:
        stdout_data, stderr_data = process.communicate(timeout=int(timeout))
    except Exception:
        try:
            p = psutil.Process(process.pid)
            for child in p.children(recursive=True):
                try:
                    child.kill()
                except psutil.NoSuchProcess:
                    pass
        except Exception:
            pass
        process.kill()
        try:
            stdout_data, stderr_data = process.communicate(timeout=1)
        except Exception:
            pass
            
    if limit_reason:
        return {
            "stdout": "",
            "stderr": f"{limit_reason} (Memory Limit: {max_memory_mb}MB, Time Limit: {timeout}s)",
            "exit_code": 1
        }
        
    return {
        "stdout": stdout_data.decode('utf-8', errors='replace'),
        "stderr": stderr_data.decode('utf-8', errors='replace'),
        "exit_code": process.returncode
    }


class CodeExecutor:
    """Handles the execution of source code for multiple languages."""

    @staticmethod
    async def run(language: str, code: str, input_data: str) -> Dict[str, Any]:
        """Executes code based on the specified language.

        Args:
            language: The programming language to use.
            code: The source code to execute.
            input_data: The input string for stdin.

        Returns:
            A dictionary containing stdout, stderr, and exit_code.
        """
        job_id: str = str(uuid.uuid4())

        handlers: Dict[str, Callable[[str, str, str], Awaitable[Dict[str, Any]]]] = {
            "python": CodeExecutor._run_python,
            "cpp": CodeExecutor._run_cpp,
            "golang": CodeExecutor._run_go,
        }

        handler = handlers.get(language, handlers.get(language.lower()))
        if not handler:
            return {
                "stdout": "",
                "stderr": f"Language {language} not supported",
                "exit_code": 1,
            }

        return await handler(job_id, code, input_data)

    @staticmethod
    async def _run_python(job_id: str, code: str, input_data: str) -> Dict[str, Any]:
        """Runs a Python script as a subprocess."""
        file_path: Path = TEMP_DIR / f"{job_id}.py"
        file_path.write_text(code, encoding="utf-8")

        result = await execute_with_limits(
            ["python", str(file_path)],
            input_data,
            timeout=5,
            max_memory_mb=250
        )
        
        if file_path.exists():
            os.remove(file_path)
            
        return result

    @staticmethod
    async def _run_cpp(job_id: str, code: str, input_data: str) -> Dict[str, Any]:
        """Compiles and runs C++ code as a subprocess."""
        source_path: Path = TEMP_DIR / f"{job_id}.cpp"
        exec_path: Path = (
            TEMP_DIR / f"{job_id}.exe"
            if os.name == "nt"
            else TEMP_DIR / f"{job_id}.out"
        )
        source_path.write_text(code, encoding="utf-8")

        # Compile synchronously or async? We can just use traditional subprocess.run for compiling
        # since compile times are short and we don't necessarily limit memory here.
        # But for stability, 10s compile timeout is good.
        compile_res = subprocess.run(
            ["g++", str(source_path), "-o", str(exec_path)],
            capture_output=True,
            text=True,
            encoding="utf-8",
        )

        if compile_res.returncode != 0:
            if source_path.exists():
                os.remove(source_path)
            return {
                "stdout": "",
                "stderr": compile_res.stderr,
                "exit_code": compile_res.returncode,
            }

        result = await execute_with_limits(
            [str(exec_path)],
            input_data,
            timeout=5,
            max_memory_mb=250
        )

        if source_path.exists():
            os.remove(source_path)
        if exec_path.exists():
            os.remove(exec_path)

        return result

    @staticmethod
    async def _run_go(job_id: str, code: str, input_data: str) -> Dict[str, Any]:
        """Runs Go code using the 'go run' command."""
        file_path: Path = TEMP_DIR / f"{job_id}.go"
        abs_path: str = str(file_path.absolute())
        file_path.write_text(code, encoding="utf-8")

        result = await execute_with_limits(
            ["go", "run", abs_path],
            input_data,
            timeout=5,  # Reduced to 5 per user instructions
            max_memory_mb=250,
            shell=True if os.name == "nt" else False
        )

        if file_path.exists():
            os.remove(file_path)

        return result
