
import React, { useState, useEffect, useRef } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { Terminal } from './components/Terminal';
import { Complexity } from './components/Complexity';
import { executeCode } from './services/api';
import { SocketManager } from './services/socket';
import { EditorState, ExecutionResult } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<EditorState>({
    code: 'def fibonacci(n):\n    if n <= 1: return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint("Fibonacci of 10 is:", fibonacci(10))',
    output: '',
    error: '',
    metrics: null,
    isRunning: false,
    connectedUsers: ['Primary User'],
  });

  const socketRef = useRef<SocketManager | null>(null);

  useEffect(() => {
    // Room ID would be dynamically assigned in production
    const roomId = 'production-session-001';
    socketRef.current = new SocketManager(roomId);
    
    socketRef.current.subscribeToUpdates((newCode: string) => {
      setState(prev => ({ ...prev, code: newCode }));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleCodeChange = (newCode: string) => {
    setState(prev => ({ ...prev, code: newCode }));
    socketRef.current?.emitCodeChange(newCode);
  };

  const handleRun = async () => {
    setState(prev => ({ ...prev, isRunning: true, output: 'Executing...', error: '' }));
    try {
      const result: ExecutionResult = await executeCode(state.code);
      setState(prev => ({
        ...prev,
        output: result.output,
        error: result.error,
        metrics: result.complexity,
        isRunning: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        output: '',
        error: 'System Error: Code execution engine unreachable. Please verify server status.',
        isRunning: false
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-[#e6edf3] font-sans overflow-hidden select-none">
      {/* Navigation / Header */}
      <header className="flex items-center justify-between px-6 py-2.5 border-b border-[#30363d] bg-[#161b22] shadow-sm z-10">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-1.5 rounded-md shadow-sm">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white">CodeSync</h1>
          </div>
          <div className="h-5 w-[1px] bg-[#30363d]"></div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-xs font-medium text-[#8b949e]">Environment: Python 3.9 (Stable)</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-[10px] uppercase font-bold text-[#484f58] tracking-widest">Active Peers</span>
            <div className="flex -space-x-1.5">
              {state.connectedUsers.map((user, idx) => (
                <div key={idx} className="w-7 h-7 rounded-full bg-[#30363d] border-2 border-[#161b22] flex items-center justify-center text-[10px] font-bold text-blue-400" title={user}>
                  {user[0].toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleRun}
            disabled={state.isRunning}
            className={`flex items-center gap-2 px-6 py-1.5 text-xs font-bold rounded transition-all duration-200 uppercase tracking-wide ${
              state.isRunning 
              ? 'bg-[#238636] opacity-60 cursor-wait' 
              : 'bg-[#238636] hover:bg-[#2ea043] text-white shadow-md'
            }`}
          >
            {state.isRunning ? (
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
            )}
            {state.isRunning ? 'Executing' : 'Run Script'}
          </button>
        </div>
      </header>

      {/* Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Container */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-[#30363d] bg-[#0d1117]">
          <div className="px-4 py-1.5 bg-[#0d1117] border-b border-[#30363d] flex items-center justify-between">
             <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-tighter">main.py</span>
          </div>
          <CodeEditor 
            value={state.code} 
            onChange={handleCodeChange}
          />
        </div>

        {/* Sidebar Analytics */}
        <aside className="w-[360px] flex flex-col bg-[#0d1117] overflow-y-auto border-l border-[#30363d]">
          <section className="p-4 border-b border-[#30363d]">
             <h2 className="text-[11px] font-bold text-[#8b949e] uppercase tracking-widest mb-4 flex items-center gap-2">
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
               Performance Analysis
             </h2>
             <Complexity metrics={state.metrics} />
          </section>
          <section className="flex-1 flex flex-col p-4 bg-[#010409]">
             <h2 className="text-[11px] font-bold text-[#8b949e] uppercase tracking-widest mb-4 flex items-center gap-2">
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               Console Output
             </h2>
             <Terminal output={state.output} error={state.error} />
          </section>
        </aside>
      </main>

      {/* Status Bar */}
      <footer className="px-4 py-1.5 border-t border-[#30363d] bg-[#161b22] text-[10px] text-[#8b949e] flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Sync Active
          </span>
          <span className="text-[#30363d]">|</span>
          <span>Python 3.9.12</span>
          <span>UTF-8</span>
        </div>
        <div className="flex gap-4">
          <span>Production Build v1.1.0</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
