# CodeSync Backend Documentation

This directory contains the Python-based execution and analysis engine.

## 🔒 Security Implementation

The core of CodeSync is the `sandbox.py` module. It uses the `docker-py` SDK to interact with the host's Docker daemon.

### Docker Socket Mounting
To allow the backend container to spawn "sibling" containers for code execution, we mount the host's Docker socket in `docker-compose.yml`:
```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

### Resource Constraints
We apply the following limits to every user-submitted script:
- **Memory**: 128MB (`mem_limit="128m"`)
- **CPU**: 0.5 Cores (`cpu_quota=50000`)
- **Network**: None (`network_mode="none"`)
- **Timeout**: 5 Seconds

## 🧪 Complexity Analysis
The `complexity.py` module uses the `ast` (Abstract Syntax Tree) module to walk through the code nodes. It specifically looks for `ast.For` and `ast.While` nodes to calculate the nesting depth and determine the Big-O estimation.

## 🛠️ API Endpoints

- `POST /api/v1/execute`: Accepts code and returns output + complexity metrics.
- `WS /ws/{room_id}`: WebSocket endpoint for code synchronization.

## ⚙️ Requirements
Ensure you have the following installed if running outside of Docker:
- `fastapi`
- `uvicorn`
- `docker` (Python SDK)
- `redis`
