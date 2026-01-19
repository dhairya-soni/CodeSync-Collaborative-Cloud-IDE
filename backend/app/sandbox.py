import os
import tempfile
import subprocess
import docker
from typing import Tuple

# Setup docker client
try:
    # Try connecting to the local docker daemon
    client = docker.from_env()
    client.ping()
except Exception as e:
    print(f"Docker Client Warning: Could not connect to Docker daemon ({e}). Falling back to insecure mode.")
    client = None

def execute_code(code: str) -> Tuple[str, str]:
    """
    Executes Python code in a secure, ephemeral Docker container.
    """
    if not client:
        return run_insecure_fallback(code)

    # 1. Create a temporary file for the user's script
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as tmp:
        tmp.write(code.encode('utf-8'))
        tmp_path = tmp.name

    try:
        # We use python:3.9-slim for execution
        # We map the host temp file to the container
        container_output = client.containers.run(
            image="python:3.9-slim",
            command=f"python /app/script.py",
            volumes={tmp_path: {'bind': '/app/script.py', 'mode': 'ro'}},
            network_mode="none",
            mem_limit="128m",
            cpu_quota=50000,
            detach=False,
            remove=True,
            stdout=True,
            stderr=True,
            timeout=5 # socket timeout
        )
        return container_output.decode('utf-8'), ""
    except docker.errors.ContainerError as e:
        return e.stdout.decode('utf-8'), e.stderr.decode('utf-8')
    except Exception as e:
        return "", f"Sandbox error: {str(e)}"
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

def run_insecure_fallback(code: str) -> Tuple[str, str]:
    """Fallback if Docker is unavailable (e.g. local dev). WARNING: Insecure."""
    try:
        result = subprocess.run(
            ["python3", "-c", code],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return "", "Execution timed out (5s limit)."
    except Exception as e:
        return "", f"Local execution failed: {str(e)}"
