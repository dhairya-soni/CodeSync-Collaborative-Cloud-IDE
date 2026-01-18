# 🚀 CodeSync: Professional Collaborative Cloud IDE

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![React](https://img.shields.io/badge/react-19-61dafb.svg)
![Docker](https://img.shields.io/badge/docker-ready-2496ed.svg)

**CodeSync** is a high-performance, real-time collaborative development environment. It enables multiple developers to synchronize code changes instantly while providing a secure, sandboxed environment for execution and automated algorithmic analysis.

---

## 🌟 Key Features

### 🛠️ Real-Time Collaboration
*   **Synchronized Editing**: Powered by WebSockets and a Redis-backed message broker for sub-100ms synchronization.
*   **Multi-User Awareness**: Visual indicators for active peers in the development session.

### 🛡️ Secure Execution Sandbox
*   **Isolated Environments**: User code executes inside ephemeral Docker containers (Alpine Linux base).
*   **Resource Constraints**: Strict memory limits (128MB) and CPU quotas to prevent resource exhaustion attacks.
*   **Network Isolation**: Containers are detached from the network to prevent unauthorized data egress.

### 📊 Algorithmic Analysis (AST)
*   **Time Complexity Estimation**: Static analysis of Python code using Abstract Syntax Trees to estimate Big-O notation.
*   **Structural Metrics**: Automatic detection of nested loop depth and iterative structures.

---

## 💻 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS |
| **Editor Engine** | Monaco Editor (VS Code core) |
| **Backend API** | FastAPI (Python 3.9) |
| **State/Sync** | WebSockets, Redis |
| **Security** | Docker Engine SDK |

---

## 🏗️ System Architecture

1.  **Client Layer**: React-based UI handles state and editor interactions.
2.  **Communication Layer**: WebSockets manage the real-time relay of code buffers between peers.
3.  **Analysis Layer**: The Python backend parses the code into an AST to calculate computational complexity without executing the code.
4.  **Execution Layer**: Code is written to a temporary volume and mounted into a restricted Docker container for safe execution.

---

## 🚀 Quick Start (Setup Instructions)

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Highly Recommended)
*   [Node.js](https://nodejs.org/) (v18+)
*   [Python 3.9+](https://www.python.org/)

### Option A: Using Docker Compose (Easiest)
This is the recommended way to see the full security features in action.

1.  Clone the repository and navigate to the project root.
2.  Run the orchestration command:
    ```bash
    docker-compose up --build
    ```
3.  Open [http://localhost:5173](http://localhost:5173) in your browser.

### Option B: Manual Setup (Local Development)
If you don't want to use Docker, the system will run in **Insecure Fallback Mode**.

**1. Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**2. Frontend Setup**
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

---

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
