import os
import tempfile
import subprocess
import docker
from typing import Tuple

try:
    client = docker.from_env()
    client.ping()
    print("[Sandbox] Docker connected.")
except Exception as e:
    print(f"[Sandbox] Docker unavailable ({e}). Using local fallback.")
    client = None

LANGUAGE_CONFIG = {
    "python":     {"image": "python:3.11-slim",  "ext": ".py",   "cmd": "python /app/script.py"},
    "javascript": {"image": "node:20-alpine",    "ext": ".js",   "cmd": "node /app/script.js"},
    "typescript": {"image": "node:20-alpine",    "ext": ".ts",   "cmd": "npx --yes ts-node /app/script.ts"},
    "go":         {"image": "golang:1.21-alpine","ext": ".go",   "cmd": "go run /app/script.go"},
    "cpp":        {"image": "gcc:13",            "ext": ".cpp",  "cmd": "sh -c 'g++ /app/script.cpp -o /tmp/a.out && /tmp/a.out'"},
    "java":       {"image": "openjdk:21-slim",   "ext": ".java", "cmd": "sh -c 'javac /app/script.java && java -cp /app Main'"},
    "rust":       {"image": "rust:1.75-slim",    "ext": ".rs",   "cmd": "sh -c 'rustc /app/script.rs -o /tmp/a.out 2>&1 && /tmp/a.out'"},
}

FALLBACK_CMDS = {
    "python":     ["python3", "-c"],
    "javascript": ["node", "-e"],
}


def execute_code(code: str, language: str = "python") -> Tuple[str, str]:
    """Execute code in a secure Docker container."""
    lang = language.lower()
    if lang not in LANGUAGE_CONFIG:
        return "", f"Unsupported language: {language}"

    if not client:
        return _fallback(code, lang)

    config = LANGUAGE_CONFIG[lang]
    suffix = config["ext"]

    # Java needs the file named Main.java
    if lang == "java":
        suffix = ".java"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(code.encode("utf-8"))
        tmp_path = tmp.name

    # Java: rename to Main.java inside a temp dir
    if lang == "java":
        import shutil
        tmp_dir = tempfile.mkdtemp()
        java_path = os.path.join(tmp_dir, "Main.java")
        shutil.copy(tmp_path, java_path)
        os.remove(tmp_path)
        tmp_path = java_path
        bind_path = tmp_dir
        container_bind = "/app"
        cmd = "sh -c 'javac /app/Main.java && java -cp /app Main'"
    else:
        bind_path = tmp_path
        container_bind = f"/app/script{suffix}"
        cmd = config["cmd"]

    try:
        container_output = client.containers.run(
            image=config["image"],
            command=cmd,
            volumes={bind_path: {"bind": container_bind, "mode": "ro"}},
            network_mode="none",
            mem_limit="128m",
            cpu_quota=50000,
            detach=False,
            remove=True,
            stdout=True,
            stderr=True,
            timeout=10,
        )
        return container_output.decode("utf-8", errors="replace"), ""
    except docker.errors.ContainerError as e:
        stdout = e.stdout.decode("utf-8", errors="replace") if e.stdout else ""
        stderr = e.stderr.decode("utf-8", errors="replace") if e.stderr else str(e)
        return stdout, stderr
    except Exception as e:
        return "", f"Sandbox error: {str(e)}"
    finally:
        try:
            if lang == "java":
                import shutil
                shutil.rmtree(tmp_dir, ignore_errors=True)
            elif os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass


def _fallback(code: str, language: str) -> Tuple[str, str]:
    """Insecure local fallback when Docker is unavailable."""
    if language not in FALLBACK_CMDS:
        return "", f"Docker is required to run {language}. Please start Docker Desktop."
    cmd = FALLBACK_CMDS[language] + [code]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
        return result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return "", "Execution timed out (5s limit)."
    except FileNotFoundError:
        return "", f"Runtime not found locally. Please start Docker Desktop."
    except Exception as e:
        return "", f"Local execution failed: {str(e)}"
