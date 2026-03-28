'use client';

import { useEditorStore, type SyncStatus } from '@/lib/store';
import { LANG_LABELS, LANG_COLORS, LANG_SHORT, formatDuration, cn } from '@/lib/utils';
import { GitBranch, Wifi, WifiOff, AlertCircle, Loader2 } from 'lucide-react';

function SyncIndicator({ status }: { status: SyncStatus }) {
  const config = {
    connected: { icon: Wifi, label: 'Live', className: 'text-green-400' },
    connecting: { icon: Loader2, label: 'Connecting…', className: 'text-yellow-400 animate-spin' },
    disconnected: { icon: WifiOff, label: 'Offline', className: 'text-ide-muted' },
    error: { icon: AlertCircle, label: 'Error', className: 'text-red-400' },
  }[status];

  const Icon = config.icon;
  return (
    <div className={cn('flex items-center gap-1.5 text-xs', config.className)}>
      <Icon className={cn('w-3 h-3', status === 'connecting' ? 'animate-spin' : '')} />
      {config.label}
    </div>
  );
}

export function StatusBar() {
  const { language, syncStatus, peers, result, roomId } = useEditorStore();

  return (
    <div className="flex items-center justify-between px-3 h-6 bg-blue-700 text-white/90 text-xs flex-shrink-0 select-none">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>
        <SyncIndicator status={syncStatus} />
        {peers.length > 0 && (
          <span className="text-white/70">{peers.length} user{peers.length !== 1 ? 's' : ''} online</span>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 text-white/70">
        {result && (
          <span>Ran in {formatDuration(result.duration_ms)}</span>
        )}
        <span className="text-white/50 font-mono text-[10px]">room/{roomId}</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: LANG_COLORS[language] }} />
          <span>{LANG_LABELS[language]}</span>
        </div>
        <span>UTF-8</span>
        <span>LF</span>
      </div>
    </div>
  );
}
