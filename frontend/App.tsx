import React, { useState, useEffect, useRef } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { Terminal } from './components/Terminal';
import { Complexity } from './components/Complexity';
import { Sidebar } from './components/Sidebar';
import { executeCode } from './services/api';
import { SocketManager } from './services/socket';
import { EditorState, ExecutionResult, ProjectFile } from './types';

const INITIAL_FILES: ProjectFile[] = [
  {
    id: 'f1',
    name: 'main.py',
    content: 'def analyze_performance(data):\n    # O(n^2) Complexity Demo\n    for i in data:\n        for j in data:\n            process(i, j)\n\nprint("Engine Active. Ready for analysis.")',
    language: 'python'
  },
  {
    id: 'f2',
    name: 'utils.py',
    content: 'def helper():\n    return "Ready"',
    language: 'python'
  }
];

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'connecting' | 'connected' | 'error' | 'closed'>('connecting');
  const [state, setState] = useState<EditorState>({
    files: INITIAL_FILES,
    activeFileId: 'f1',
    output: '',
    error: '',
    metrics: null,
    telemetry: null,
    isRunning: false,
    connectedUsers: ['Lead_Architect', 'Contributor_1']
  });

  const socketRef = useRef<SocketManager | null>(null);
  const activeFile = state.files.find(f => f.id === state.activeFileId) || state.files[0];

  // Initialize Socket once on mount
  useEffect(() => {
    const manager = new SocketManager('shared-room-v1');
    socketRef.current = manager;

    manager.onStatusChange((status) => setSyncStatus(status));

    manager.subscribeToUpdates((newCode: string) => {
      // Only update if the code is actually different to avoid editor cursor jumps
      setState(prev => {
        const currentActive = prev.files.find(f => f.id === prev.activeFileId);
        if (currentActive && currentActive.content === newCode) return prev;
        
        return {
          ...prev,
          files: prev.files.map(f => f.id === prev.activeFileId ? { ...f, content: newCode } : f)
        };
      });
    });

    return () => manager.disconnect();
  }, []);

  const handleCodeChange = (newCode: string) => {
    setState(prev => ({
      ...prev,
      files: prev.files.map(f => f.id === prev.activeFileId ? { ...f, content: newCode } : f)
    }));
    // Sync to other peers
    socketRef.current?.emitCodeChange(newCode);
  };

  const handleRun = async () => {
    setState(prev => ({ ...prev, isRunning: true, output: 'Allocating sandbox...', error: '' }));
    try {
      const result = await executeCode(activeFile.content);
      setState(prev => ({
        ...prev,
        output: result.output,
        error: result.error,
        metrics: result.complexity,
        telemetry: result.telemetry || null,
        isRunning: false
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        output: '',
        error: err.message,
        isRunning: false
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-[#e6edf3] font-sans overflow-hidden">
      {/* PROFESSIONAL TITLE BAR */}
      <header className="flex items-center justify-between px-3 h-10 bg-[#161b22] border-b border-[#30363d] z-50 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1 rounded">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </div>
            <span className="text-xs font-bold tracking-widest uppercase hidden sm:inline">CodeSync <span className="text-blue-500">Workspace</span></span>
          </div>
          
          <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d]">
            <span className={`w-1.5 h-1.5 rounded-full ${
              syncStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
              syncStatus === 'error' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
            }`}></span>
            <span className="text-[9px] font-bold text-[#8b949e] uppercase">
              {syncStatus === 'connected' ? 'Synced' : syncStatus}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-1.5">
            {state.connectedUsers.map((u, i) => (
              <div key={i} className="w-5 h-5 rounded-full border border-[#161b22] bg-[#30363d] text-[8px] flex items-center justify-center font-bold text-blue-400" title={u}>{u[0]}</div>
            ))}
          </div>
          <button 
            onClick={handleRun}
            disabled={state.isRunning}
            className="flex items-center gap-2 px-3 py-1 text-[9px] font-bold rounded bg-blue-600 hover:bg-blue-500 text-white transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            {state.isRunning ? 'Executing...' : 'Run Analysis'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* ACTIVITY BAR */}
        <nav className="w-12 bg-[#0d1117] border-r border-[#30363d] flex flex-col items-center py-4 gap-6 flex-shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1.5 transition-colors rounded ${isSidebarOpen ? 'text-blue-500 bg-blue-500/10 border-l-2 border-blue-500' : 'text-[#484f58] hover:text-[#8b949e]'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
          </button>
          <div className="text-[#484f58] hover:text-[#8b949e] p-1.5 cursor-pointer transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div>
          <div className="text-[#484f58] hover:text-[#8b949e] p-1.5 cursor-pointer transition-colors mt-auto mb-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>
        </nav>

        {/* EXPLORER SIDEBAR */}
        {isSidebarOpen && (
          <aside className="w-56 flex-shrink-0 bg-[#161b22] border-r border-[#30363d] overflow-hidden transition-all duration-300">
            <Sidebar 
              files={state.files} 
              activeFileId={state.activeFileId} 
              onFileSelect={(id) => setState(prev => ({ ...prev, activeFileId: id }))}
              onNewFile={() => {}}
              onDeleteFile={() => {}}
            />
          </aside>
        )}

        {/* MAIN EDITOR AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0d1117]">
          {/* TAB BAR */}
          <div className="flex bg-[#161b22] border-b border-[#30363d] h-9 overflow-x-auto no-scrollbar">
            {state.files.map(file => (
              <div 
                key={file.id}
                onClick={() => setState(prev => ({ ...prev, activeFileId: file.id }))}
                className={`flex items-center gap-2 px-4 h-full text-[11px] cursor-pointer border-r border-[#30363d] transition-colors ${
                  state.activeFileId === file.id ? 'bg-[#0d1117] text-white border-t-2 border-t-blue-500' : 'text-[#8b949e] hover:bg-[#1f242c]'
                }`}
              >
                <span className="text-blue-400 font-bold">Py</span>
                {file.name}
              </div>
            ))}
          </div>

          <div className="flex-1 relative">
            <CodeEditor value={activeFile.content} onChange={handleCodeChange} />
          </div>
        </div>

        {/* ANALYTICS & TELEMETRY SIDEBAR */}
        <aside className="w-[300px] lg:w-[380px] flex-shrink-0 flex flex-col bg-[#0d1117] border-l border-[#30363d] hidden md:flex">
          <div className="p-4 border-b border-[#30363d] bg-[#161b22]/40">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">System Metrics</h2>
               <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">LIVE</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
               <div className="p-2 bg-[#0d1117] rounded border border-[#30363d]">
                  <div className="text-[8px] text-[#484f58] uppercase font-bold">Sync Delay</div>
                  <div className="text-xs font-mono text-emerald-400 font-bold">{state.telemetry?.sync_latency || '0'}ms</div>
               </div>
               <div className="p-2 bg-[#0d1117] rounded border border-[#30363d]">
                  <div className="text-[8px] text-[#484f58] uppercase font-bold">Cold Start</div>
                  <div className="text-xs font-mono text-sky-400 font-bold">142ms</div>
               </div>
               <div className="p-2 bg-[#0d1117] rounded border border-[#30363d]">
                  <div className="text-[8px] text-[#484f58] uppercase font-bold">Mem RSS</div>
                  <div className="text-xs font-mono text-[#c9d1d9] font-bold">{state.telemetry?.memory_usage || '0MB'}</div>
               </div>
               <div className="p-2 bg-[#0d1117] rounded border border-[#30363d]">
                  <div className="text-[8px] text-[#484f58] uppercase font-bold">Container</div>
                  <div className="text-[10px] font-mono text-blue-400 font-bold truncate">Isolated-v1</div>
               </div>
            </div>
          </div>

          <div className="p-4 overflow-y-auto no-scrollbar">
            <Complexity metrics={state.metrics} />
          </div>

          <div className="flex-1 flex flex-col min-h-0 bg-[#010409]">
             <div className="px-4 py-1.5 border-y border-[#30363d] bg-[#161b22]/50 text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">Debugger Console</div>
             <div className="flex-1 p-3 overflow-y-auto">
                <Terminal output={state.output} error={state.error} />
             </div>
          </div>
        </aside>
      </main>

      {/* STATUS BAR */}
      <footer className="h-6 bg-blue-600 text-white text-[9px] flex justify-between items-center px-3 font-bold select-none flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
            Engine Online
          </div>
          <span className="opacity-70">Python 3.12</span>
        </div>
        <div className="flex items-center gap-4 text-[8px] tracking-tighter">
          <span>{syncStatus === 'connected' ? 'CLUSTER-READY' : 'CONNECTING...'}</span>
          <span className="bg-blue-700 px-1.5 rounded">PRO v1.5</span>
        </div>
      </footer>
    </div>
  );
};

export default App;