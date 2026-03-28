'use client';

import { Files, Search, GitBranch, Settings, Play, Users, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/lib/store';

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const TOP_ITEMS = [
  { id: 'explorer', icon: Files, label: 'Explorer' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'git', icon: GitBranch, label: 'Source Control' },
  { id: 'collab', icon: Users, label: 'Collaborators' },
];

export function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  const { toggleSidebar, sidebarOpen } = useEditorStore();

  return (
    <div className="flex flex-col items-center justify-between w-12 bg-ide-surface border-r border-ide-border py-2 flex-shrink-0 z-10">
      {/* Top icons */}
      <div className="flex flex-col items-center gap-1">
        {TOP_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={label}
            onClick={() => {
              if (activeView === id && sidebarOpen) {
                toggleSidebar();
              } else {
                onViewChange(id);
                if (!sidebarOpen) toggleSidebar();
              }
            }}
            className={cn(
              'group relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150',
              activeView === id && sidebarOpen
                ? 'text-ide-text bg-ide-bg'
                : 'text-ide-muted hover:text-ide-text hover:bg-ide-bg/60'
            )}
          >
            <Icon className="w-5 h-5" />
            {/* Active indicator */}
            {activeView === id && sidebarOpen && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-ide-accent rounded-r-full" />
            )}
            {/* Tooltip */}
            <span className="absolute left-full ml-2 px-2 py-1 rounded bg-ide-surface border border-ide-border text-xs text-ide-text whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom icon */}
      <button
        title="Settings"
        onClick={() => {
          if (activeView === 'settings' && sidebarOpen) {
            toggleSidebar();
          } else {
            onViewChange('settings');
            if (!sidebarOpen) toggleSidebar();
          }
        }}
        className={cn(
          'group relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150',
          activeView === 'settings' && sidebarOpen
            ? 'text-ide-text bg-ide-bg'
            : 'text-ide-muted hover:text-ide-text hover:bg-ide-bg/60'
        )}
      >
        <Settings className="w-5 h-5" />
        {activeView === 'settings' && sidebarOpen && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-ide-accent rounded-r-full" />
        )}
        <span className="absolute left-full ml-2 px-2 py-1 rounded bg-ide-surface border border-ide-border text-xs text-ide-text whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
          Settings
        </span>
      </button>
    </div>
  );
}
