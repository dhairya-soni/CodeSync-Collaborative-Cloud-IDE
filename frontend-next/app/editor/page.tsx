'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEditorStore } from '@/lib/store';
import { SocketManager } from '@/lib/socket';
import { executeCode } from '@/lib/api';
import { generatePeerColor, getInitials } from '@/lib/utils';
import { ActivityBar } from '@/components/editor/ActivityBar';
import { Sidebar } from '@/components/editor/Sidebar';
import { TabBar } from '@/components/editor/TabBar';
import { BottomPanel } from '@/components/editor/BottomPanel';
import { StatusBar } from '@/components/editor/StatusBar';
import { Toolbar } from '@/components/editor/Toolbar';
import { toast } from 'sonner';

const MonacoEditor = dynamic(
  () => import('@/components/editor/MonacoEditor').then(m => m.MonacoEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-ide-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-ide-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-ide-muted">Loading Monaco Editor…</span>
        </div>
      </div>
    ),
  }
);

// Stable user identity for this session
function useSessionUser() {
  return useMemo(() => {
    const id    = Math.random().toString(36).slice(2, 10);
    const color = generatePeerColor(id);
    const name  = `User ${id.slice(0, 4)}`;
    return { id, color, name };
  }, []);
}

export default function EditorPage() {
  const {
    roomId, language,
    setResult, setIsRunning, setSyncStatus,
    setPeers, updatePeerCursor, removePeerCursor, pushActivity,
    sidebarOpen, getActiveFile, setActivePanel, updateActiveFile,
  } = useEditorStore();

  const socketRef  = useRef<SocketManager | null>(null);
  const isReceiving = useRef(false);
  const [activeView, setActiveView] = useState('explorer');
  const me = useSessionUser();

  // ── Run code ─────────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    const file = getActiveFile();
    if (!file) return;

    setIsRunning(true);
    setActivePanel('output');
    const t0 = Date.now();

    // Notify peers that we ran
    socketRef.current?.sendActivity({ userId: me.id, name: me.name, color: me.color, action: 'ran' });

    try {
      const result = await executeCode(file.content, language);
      if (!result.duration_ms) result.duration_ms = Date.now() - t0;
      setResult(result);

      if (result.error) {
        setActivePanel('problems');
        toast.error('Execution error', { description: result.error.slice(0, 120) });
      } else {
        toast.success(`Done in ${result.duration_ms}ms`, {
          description: result.complexity ? `${result.complexity.big_o} · ${result.complexity.space_complexity} space` : 'Execution complete',
          duration: 3000,
        });
        if (result.complexity) setActivePanel('complexity');
      }
    } catch (err: any) {
      setResult({ output: '', error: err?.message ?? 'Unknown error', duration_ms: Date.now() - t0 });
      toast.error('Run failed');
    } finally {
      setIsRunning(false);
    }
  }, [language, me]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard shortcut ────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleRun(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRun]);

  // ── WebSocket ────────────────────────────────────────────────
  useEffect(() => {
    const socket = new SocketManager(roomId);
    socketRef.current = socket;

    socket.onStatusChange(status => {
      setSyncStatus(status);
      if (status === 'connected') toast.success('Live sync connected', { duration: 2000 });
    });

    socket.onCodeUpdate(code => {
      isReceiving.current = true;
      updateActiveFile(code);
      setTimeout(() => { isReceiving.current = false; }, 50);
    });

    socket.onPeerUpdate(ids => {
      setPeers(ids.map(id => ({
        id,
        name:     `User ${id.slice(0, 4)}`,
        color:    generatePeerColor(id),
        initials: getInitials(`User ${id.slice(0, 4)}`),
      })));
    });

    socket.onCursorUpdate(cursor => {
      updatePeerCursor(cursor);
    });

    socket.onActivity(event => {
      pushActivity(event);
      const verb = event.action === 'joined' ? 'joined the room' : event.action === 'left' ? 'left' : event.action === 'ran' ? 'ran code' : 'edited';
      toast(`${event.name} ${verb}`, { duration: 2500 });
    });

    socket.connect();

    // Announce self
    setTimeout(() => {
      socket.sendActivity({ userId: me.id, name: me.name, color: me.color, action: 'joined' });
    }, 800);

    return () => {
      socket.sendActivity({ userId: me.id, name: me.name, color: me.color, action: 'left' });
      socket.disconnect();
    };
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ide-layout">
      <Toolbar onRun={handleRun} />

      <div className="ide-body">
        <ActivityBar activeView={activeView} onViewChange={setActiveView} />

        <AnimatePresence>
          {sidebarOpen && <Sidebar activeView={activeView} />}
        </AnimatePresence>

        <div className="ide-main">
          <TabBar />
          <div className="ide-editor-area">
            <MonacoEditor
              socketRef={socketRef}
              isReceiving={isReceiving}
              userId={me.id}
              userName={me.name}
              userColor={me.color}
            />
            <BottomPanel />
          </div>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
