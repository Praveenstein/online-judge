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

        handler = handlers.get(language)
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

        result = subprocess.run(
            ["python", str(file_path)],
            input=input_data,
            capture_output=True,
            text=True,
            encoding="utf-8",
            env={**os.environ, "PYTHONIOENCODING": "utf-8"},
            timeout=5,
        )
        os.remove(file_path)
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode,
        }

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

        compile_res = subprocess.run(
            ["g++", str(source_path), "-o", str(exec_path)],
            capture_output=True,
            text=True,
            encoding="utf-8",
        )

        if compile_res.returncode != 0:
            os.remove(source_path)
            return {
                "stdout": "",
                "stderr": compile_res.stderr,
                "exit_code": compile_res.returncode,
            }

        run_res = subprocess.run(
            [str(exec_path)],
            input=input_data,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=5,
        )

        os.remove(source_path)
        if exec_path.exists():
            os.remove(exec_path)

        return {
            "stdout": run_res.stdout,
            "stderr": run_res.stderr,
            "exit_code": run_res.returncode,
        }

    @staticmethod
    async def _run_go(job_id: str, code: str, input_data: str) -> Dict[str, Any]:
        """Runs Go code using the 'go run' command."""
        file_path: Path = TEMP_DIR / f"{job_id}.go"
        abs_path: str = str(file_path.absolute())
        file_path.write_text(code, encoding="utf-8")

        result = subprocess.run(
            ["go", "run", abs_path],
            input=input_data,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=10,
            shell=True if os.name == "nt" else False,
        )

        if file_path.exists():
            os.remove(file_path)

        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode,
        }
