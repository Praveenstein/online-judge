import re
from fastapi import HTTPException

# Security rules mapped directly from security_rules.yml
SECURITY_RULES = {
    "python": [
        {
            "id": "python-jailbreak-imports",
            "pattern": r"^\s*(?:import\s+[\w\s,\.]*\b(?:os|subprocess|sys)\b|from\s+(?:os|subprocess|sys)\b)",
            "message": "Critical: Access to system-level modules is prohibited."
        },
        {
            "id": "python-network-access",
            "pattern": r"^\s*(?:import\s+[\w\s,\.]*\b(?:socket|requests)\b|from\s+(?:socket|requests)\b)|.*\bsocket\.socket\s*\(",
            "message": "Security: Network access is disabled."
        },
        {
            "id": "python-dynamic-execution",
            "pattern": r"\b(?:eval|exec|__import__)\s*\(",
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
