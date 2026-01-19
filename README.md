#  CodeSync: Professional Collaborative Cloud IDE

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/react-19-61dafb.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/docker-isolated-2496ed.svg)](https://www.docker.com/)

**CodeSync** is a high-performance, real-time collaborative development environment. It bridges the gap between remote collaboration and local development by providing a synchronized editor, secure containerized execution, and automated static analysis of algorithmic efficiency.

---

##  Key Technical Features

###  Real-Time Collaboration
*   **WebSocket Engine**: Implements bidirectional communication for instant code synchronization.
*   **Session Persistence**: Maintains state across connected peers with sub-100ms latency.

###  Secure Execution Sandbox (Docker)
*   **Isolation**: Every execution triggers an ephemeral **Docker** container (Alpine-based) to ensure host system safety.
*   **Resource Throttling**: Hard-coded limits for user scripts: **128MB RAM** and **50k CPU quota**.
*   **Network Air-gap**: Containers are spawned with `--network none` to prevent data exfiltration.

###  Algorithmic Analysis (AST)
*   **Static Analysis**: Uses Python's `ast` module to walk the Abstract Syntax Tree.
*   **Heuristic Engine**: Calculates Big-O complexity (O(1), O(n), O(n²)) and loop-nesting depth without executing the code.

---

##  Technical Architecture

1.  **Frontend**: React 19 + TypeScript + Monaco Editor (VS Code's Core).
2.  **API Layer**: FastAPI (Uvicorn) for high-concurrency handling.
3.  **Analysis Layer**: AST-based static complexity estimation.
4.  **Sandbox Layer**: Docker Engine SDK for containerized isolation.

---

##  Installation & Setup

### Prerequisites
*   **Python 3.12+**
*   **Node.js 18+**
*   **Docker Desktop** (Required for the secure sandbox feature)

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## Future Updates:
- [ ] **Distributed State**: Integrating **Redis** for persistence across multiple backend instances.
- [ ] **Cloud Support**: AWS Lambda/Fargate integration for elastic scaling.
- [ ] **Multi-Language Support**: Expanding sandboxes for Node.js, Go, and C++.

