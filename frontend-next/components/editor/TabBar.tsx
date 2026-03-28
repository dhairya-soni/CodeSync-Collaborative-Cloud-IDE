'use client';

import { X } from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { LANG_SHORT, LANG_COLORS, cn } from '@/lib/utils';

export function TabBar() {
  const { files, activeFileId, setActiveFile, closeFile } = useEditorStore();

  return (
    <div className="flex items-end bg-ide-surface border-b border-ide-border overflow-x-auto flex-shrink-0 h-9 scrollbar-none">
      {files.map(file => {
        const isActive = file.id === activeFileId;
        const langColor = LANG_COLORS[file.language];
        return (
          <div
            key={file.id}
            onClick={() => setActiveFile(file.id)}
            className={cn(
              'group flex items-center gap-2 px-4 h-full border-r border-ide-border cursor-pointer flex-shrink-0 transition-colors',
              isActive
                ? 'bg-ide-bg text-ide-text border-b border-b-ide-accent'
                : 'bg-ide-surface text-ide-muted hover:bg-ide-bg/50 hover:text-ide-text'
            )}
            style={{ minWidth: 110, maxWidth: 180 }}
          >
            {/* Language colour dot instead of emoji */}
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: langColor }} />
            <span className="text-xs font-mono truncate flex-1">{file.name}</span>
            {file.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-ide-accent flex-shrink-0" />}
            {files.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); closeFile(file.id); }}
                className={cn(
                  'flex-shrink-0 p-0.5 rounded transition-all text-ide-muted hover:text-ide-text',
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                )}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
