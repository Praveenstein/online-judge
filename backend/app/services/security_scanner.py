import re
from fastapi import HTTPException

# Security rules mapped directly from security_rules.yml
SECURITY_RULES = {
    "python": [
        {
            "id": "python-jailbreak-imports",
            "pattern": r"(?i)(___?import___\s*\(|import\s+(?:os|subprocess|sys|pty|shlex|commands)\b|from\s+(?:os|subprocess|sys|pty|shlex|commands)\b|__builtins__|getattr\s*\(\s*__import__)",
            "message": "Critical: Access to system-level modules is prohibited."
        },
        {
            "id": "python-network-access",
            "pattern": r"(?i)(import\s+(?:socket|requests|urllib|httplib|ftp|telnet|xmlrpc)\b|from\s+(?:socket|requests|urllib|httplib|ftp|telnet|xmlrpc)\b|\bsocket\.socket\s*\()",
            "message": "Security: Network access is disabled."
        },
        {
            "id": "python-dynamic-execution",
            "pattern": r"(?i)\b(?:eval|exec|compile|globals|locals)\s*\(",
            "message": "Security: Dynamic code execution is forbidden."
        }
    ],
    "cpp": [
        {
            "id": "cpp-danger-includes",
            "pattern": r'#include\s*[<"](?:fstream|filesystem|sys/socket\.h|netinet/in\.h|unistd\.h)[>"]',
            "message": "Critical: System and Network headers are prohibited."
        },
        {
            "id": "cpp-process-execution",
            "pattern": r"\b(?:system|popen|exec|fork)\s*\(",
            "message": "Security: Command execution and process forking are disabled."
        },
        {
            "id": "cpp-file-io",
            "pattern": r"\b(?:fopen|open|rename|remove)\s*\(",
            "message": "Security: Direct file I/O is disabled."
        }
    ],
    "go": [
        {
            "id": "go-jailbreak-imports",
            "pattern": r'"(?:os|os/exec|net|net/http|syscall|unsafe)"',
            "message": "Critical: Access to system, network, or unsafe modules is prohibited."
        },
        {
            "id": "go-command-execution",
            "pattern": r"\bexec\.Command(?:Context)?\s*\(",
            "message": "Security: Process execution via os/exec is disabled."
        }
    ]
}

def check_security_rules(code: str, language: str) -> None:
    """
    Scans the provided code against rudimentary security rules to prevent malicious execution.
    Raises an HTTPException if malicious patterns are detected.
    """
    if not code or not language:
        return

    lang = language.lower()
    
    # Normalize language aliases
    if lang in ["c", "c++"]:
        lang = "cpp"
    elif lang == "golang":
        lang = "go"
        
    rules = SECURITY_RULES.get(lang, [])
    
    if not rules:
        return
        
    lines = code.splitlines()
    for line_num, line in enumerate(lines, start=1):
        for rule in rules:
            if re.search(rule["pattern"], line):
                raise HTTPException(
                    status_code=400,
                    detail=f"Security Violation: {rule['message']} (Line {line_num})"
                )

def sanitize_ai_prompt(prompt: str, max_length: int = 2000) -> str:
    """
    Sanitizes user input intended for an AI prompt to mitigate basic prompt injection.
    """
    if not prompt:
        return ""
    
    # 1. Truncate to reasonable length to prevent payload stuffing
    prompt = prompt[:max_length]
    
    # 2. Block simple explicit injection attempts
    banned_phrases = [
        "ignore previous instructions", 
        "ignore all previous", 
        "you are now", 
        "system prompt", 
        "bypass", 
        "jailbreak",
        "forget previous"
    ]
    
    lower_prompt = prompt.lower()
    for phrase in banned_phrases:
        if phrase in lower_prompt:
            raise HTTPException(
                status_code=400,
                detail="Security Violation: Prohibited phrasing detected in prompt."
            )
            
    # 3. Strip any weird control characters that might confuse the model
    prompt = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]', '', prompt)
    
    return prompt

