'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ChevronDown, ChevronRight, Folder, FolderOpen,
  FileCode, X, Users, Search, FolderPlus, Clock,
} from 'lucide-react';
import { useEditorStore, type Language } from '@/lib/store';
import { LANG_SHORT, LANG_COLORS, cn } from '@/lib/utils';

// ── Language badge (no emoji) ─────────────────────────────────
function LangBadge({ lang }: { lang: Language }) {
  const color = LANG_COLORS[lang];
  return (
    <span
      className="px-1 rounded text-[9px] font-bold font-mono flex-shrink-0"
      style={{ color, background: color + '22' }}
    >
      {LANG_SHORT[lang]}
    </span>
  );
}

// ── Language options ──────────────────────────────────────────
const LANG_OPTIONS: { value: Language; label: string }[] = [
  { value: 'python',     label: 'Python'      },
  { value: 'javascript', label: 'JavaScript'  },
  { value: 'typescript', label: 'TypeScript'  },
  { value: 'go',         label: 'Go'          },
  { value: 'cpp',        label: 'C++'         },
  { value: 'java',       label: 'Java'        },
  { value: 'rust',       label: 'Rust'        },
];

// ── File Explorer View ────────────────────────────────────────
function ExplorerView() {
  const {
    files, folders, activeFileId,
    setActiveFile, addFile, closeFile,
    addFolder, toggleFolder, deleteFolder,
  } = useEditorStore();

  // null = root, string = folder id
  const [newFileTarget, setNewFileTarget] = useState<string | null | false>(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newName,       setNewName]       = useState('');
  const [newLang,       setNewLang]       = useState<Language>('python');
  const [newFolderName, setNewFolderName] = useState('');

  const rootFiles = files.filter(f => !f.folderId);
  const showNewFile = newFileTarget !== false;

  const handleAddFile = () => {
    if (!newName.trim()) return;
    const ext = newName.includes('.') ? '' : `.${newLang === 'python' ? 'py' : newLang === 'javascript' ? 'js' : newLang === 'typescript' ? 'ts' : newLang === 'go' ? 'go' : newLang === 'cpp' ? 'cpp' : newLang === 'java' ? 'java' : 'rs'}`;
    addFile(newName.trim() + ext, newLang, typeof newFileTarget === 'string' ? newFileTarget : undefined);
    setNewName(''); setNewFileTarget(false);
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    addFolder(newFolderName.trim());
    setNewFolderName(''); setShowNewFolder(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-ide-border">
        <span className="text-[11px] font-semibold text-ide-muted uppercase tracking-wider">Explorer</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNewFolder(true)}
            title="New folder"
            className="p-1 rounded text-ide-muted hover:text-ide-text hover:bg-ide-bg transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setNewFileTarget(null)}
            title="New file"
            className="p-1 rounded text-ide-muted hover:text-ide-text hover:bg-ide-bg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {/* Section label */}
        <div className="px-3 py-1 text-[10px] font-semibold text-ide-muted uppercase tracking-wider">
          CodeSync Project
        </div>

        {/* Folders */}
        {folders.map(folder => {
          const folderFiles = files.filter(f => f.folderId === folder.id);
          return (
            <div key={folder.id}>
              <div
                className="group flex items-center gap-1.5 px-3 py-1 cursor-pointer hover:bg-ide-bg/50 transition-colors"
                onClick={() => toggleFolder(folder.id)}
              >
                {folder.expanded
                  ? <FolderOpen className="w-3.5 h-3.5 text-ide-yellow flex-shrink-0" />
                  : <Folder     className="w-3.5 h-3.5 text-ide-yellow flex-shrink-0" />
                }
                {folder.expanded
                  ? <ChevronDown   className="w-3 h-3 text-ide-muted" />
                  : <ChevronRight  className="w-3 h-3 text-ide-muted" />
                }
                <span className="text-xs text-ide-text flex-1 truncate">{folder.name}</span>
                <button
                  onClick={e => { e.stopPropagation(); if (!folder.expanded) toggleFolder(folder.id); setNewFileTarget(folder.id); }}
                  title="New file in folder"
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-ide-accent transition-all"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); deleteFolder(folder.id); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              {folder.expanded && folderFiles.map(file => (
                <FileRow key={file.id} file={file} isActive={file.id === activeFileId} indent={2} />
              ))}
              {folder.expanded && folderFiles.length === 0 && newFileTarget !== folder.id && (
                <div className="px-10 py-1 text-[11px] text-ide-muted italic">empty folder</div>
              )}
              {/* Inline new file form inside this folder */}
              <AnimatePresence>
                {newFileTarget === folder.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-8 pr-3 py-2"
                  >
                    <input
                      autoFocus
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddFile(); if (e.key === 'Escape') { setNewFileTarget(false); setNewName(''); } }}
                      placeholder="filename.py"
                      className="w-full bg-ide-bg border border-ide-border rounded px-2 py-1 text-xs text-ide-text font-mono mb-1.5 outline-none focus:border-ide-accent"
                    />
                    <select
                      value={newLang}
                      onChange={e => setNewLang(e.target.value as Language)}
                      className="w-full bg-ide-bg border border-ide-border rounded px-2 py-1 text-xs text-ide-text outline-none focus:border-ide-accent mb-1.5"
                    >
                      {LANG_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                    <div className="flex gap-1.5">
                      <button onClick={handleAddFile} className="flex-1 py-1 rounded bg-ide-accent/20 text-ide-accent text-xs hover:bg-ide-accent/30 transition-colors">Create</button>
                      <button onClick={() => { setNewFileTarget(false); setNewName(''); }} className="flex-1 py-1 rounded bg-ide-surface text-ide-muted text-xs hover:text-ide-text transition-colors">Cancel</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Root files */}
        {rootFiles.map(file => (
          <FileRow key={file.id} file={file} isActive={file.id === activeFileId} indent={1} />
        ))}

        {/* New folder form */}
        <AnimatePresence>
          {showNewFolder && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-3 py-2 border-t border-ide-border"
            >
              <input
                autoFocus
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddFolder(); if (e.key === 'Escape') setShowNewFolder(false); }}
                placeholder="folder-name"
                className="w-full bg-ide-bg border border-ide-border rounded px-2 py-1 text-xs text-ide-text font-mono mb-2 outline-none focus:border-ide-accent"
              />
              <div className="flex gap-2">
                <button onClick={handleAddFolder} className="flex-1 py-1 rounded bg-ide-accent/20 text-ide-accent text-xs hover:bg-ide-accent/30 transition-colors">Create</button>
                <button onClick={() => setShowNewFolder(false)} className="flex-1 py-1 rounded bg-ide-surface text-ide-muted text-xs hover:text-ide-text transition-colors">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New file form (root level) */}
        <AnimatePresence>
          {newFileTarget === null && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-3 py-2 border-t border-ide-border"
            >
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddFile(); if (e.key === 'Escape') { setNewFileTarget(false); setNewName(''); } }}
                placeholder="filename.py"
                className="w-full bg-ide-bg border border-ide-border rounded px-2 py-1 text-xs text-ide-text font-mono mb-2 outline-none focus:border-ide-accent"
              />
              <select
                value={newLang}
                onChange={e => setNewLang(e.target.value as Language)}
                className="w-full bg-ide-bg border border-ide-border rounded px-2 py-1 text-xs text-ide-text outline-none focus:border-ide-accent mb-2"
              >
                {LANG_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={handleAddFile} className="flex-1 py-1 rounded bg-ide-accent/20 text-ide-accent text-xs hover:bg-ide-accent/30 transition-colors">Create</button>
                <button onClick={() => { setNewFileTarget(false); setNewName(''); }} className="flex-1 py-1 rounded bg-ide-surface text-ide-muted text-xs hover:text-ide-text transition-colors">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FileRow({ file, isActive, indent }: { file: any; isActive: boolean; indent: number }) {
  const { setActiveFile, closeFile, files } = useEditorStore();
  return (
    <div
      onClick={() => setActiveFile(file.id)}
      className={cn(
        'group flex items-center gap-2 py-1 cursor-pointer text-xs transition-colors',
        isActive ? 'bg-ide-bg text-ide-text' : 'text-ide-muted hover:bg-ide-bg/50 hover:text-ide-text',
      )}
      style={{ paddingLeft: indent * 12 }}
    >
      <FileCode className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
      <span className="flex-1 truncate font-mono">{file.name}</span>
      <LangBadge lang={file.language} />
      {file.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-ide-accent flex-shrink-0" />}
      {files.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); closeFile(file.id); }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 mr-1 transition-all"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ── Search View ───────────────────────────────────────────────
function SearchView() {
  const [query, setQuery] = useState('');
  const { files, setActiveFile } = useEditorStore();

  const results = query.length >= 2
    ? files.flatMap(file => {
        const lines = file.content.split('\n');
        return lines
          .map((line, i) => ({ file, lineNum: i + 1, line, idx: line.toLowerCase().indexOf(query.toLowerCase()) }))
          .filter(r => r.idx !== -1)
          .slice(0, 8);
      })
    : [];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-ide-border">
        <span className="text-[11px] font-semibold text-ide-muted uppercase tracking-wider">Search</span>
      </div>
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ide-muted" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search in files…"
            className="w-full bg-ide-bg border border-ide-border rounded-lg pl-8 pr-3 py-2 text-xs text-ide-text outline-none focus:border-ide-accent transition-colors font-mono"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {results.length === 0 && query.length >= 2 && (
          <p className="text-xs text-ide-muted text-center py-6">No matches found</p>
        )}
        {results.length === 0 && query.length < 2 && (
          <p className="text-xs text-ide-muted px-1">Type at least 2 characters to search across all open files.</p>
        )}
        {results.map((r, i) => (
          <button
            key={i}
            onClick={() => setActiveFile(r.file.id)}
            className="w-full text-left mb-1 p-2 rounded-lg hover:bg-ide-bg transition-colors group"
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-semibold text-ide-accent truncate">{r.file.name}</span>
              <span className="text-[10px] text-ide-muted ml-auto flex-shrink-0">:{r.lineNum}</span>
            </div>
            <div className="text-[11px] font-mono text-ide-muted truncate">
              {r.line.slice(Math.max(0, r.idx - 10), r.idx)}
              <span className="text-ide-text bg-ide-accent/20 rounded px-0.5">{r.line.slice(r.idx, r.idx + query.length)}</span>
              {r.line.slice(r.idx + query.length, r.idx + query.length + 30)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Collaborators View ────────────────────────────────────────
function CollabView() {
  const { peers, roomId, roomPin, syncStatus, activityFeed } = useEditorStore();

  const statusColor = { connected: '#3fb950', connecting: '#d29922', disconnected: '#8b949e', error: '#f85149' }[syncStatus];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-ide-border">
        <span className="text-[11px] font-semibold text-ide-muted uppercase tracking-wider">Collaborators</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Room info */}
        <div className="p-3 rounded-lg bg-ide-bg border border-ide-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-ide-muted">Room</span>
            <span className="text-[11px] font-mono text-ide-accent">{roomId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-ide-muted">PIN</span>
            <span className="text-base font-black font-mono tracking-widest text-ide-text">{roomPin}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-ide-border">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
            <span className="text-[11px]" style={{ color: statusColor }}>{syncStatus}</span>
          </div>
        </div>

        {/* Active users */}
        <div>
          <div className="text-[10px] font-semibold text-ide-muted uppercase tracking-wider mb-2">
            Active ({peers.length + 1})
          </div>
          {/* Self */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-ide-bg mb-1">
            <div className="w-6 h-6 rounded-full bg-ide-accent flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
              You
            </div>
            <span className="text-xs text-ide-text flex-1">You</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
          {peers.map(peer => (
            <div key={peer.id} className="flex items-center gap-2 p-2 rounded-lg bg-ide-bg mb-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ background: peer.color }}
              >
                {peer.initials}
              </div>
              <span className="text-xs text-ide-text flex-1 truncate">{peer.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>
          ))}
          {peers.length === 0 && (
            <p className="text-[11px] text-ide-muted italic">Share the PIN to invite others.</p>
          )}
        </div>

        {/* Activity feed */}
        {activityFeed.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-ide-muted uppercase tracking-wider mb-2">
              <Clock className="w-3 h-3" /> Activity
            </div>
            <div className="space-y-1">
              {activityFeed.slice(0, 10).map(ev => (
                <div key={ev.id} className="flex items-start gap-2 text-[11px]">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ background: ev.color }}
                  >
                    {ev.name[0]}
                  </div>
                  <span className="text-ide-muted">
                    <span className="text-ide-text font-medium">{ev.name}</span>
                    {' '}{ev.action === 'joined' ? 'joined the room' : ev.action === 'left' ? 'left' : ev.action === 'ran' ? 'ran code' : 'edited'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Settings View ─────────────────────────────────────────────
function SettingsView() {
  const { settings, updateSettings } = useEditorStore();

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-ide-border">
        <span className="text-[11px] font-semibold text-ide-muted uppercase tracking-wider">Settings</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">

        {/* Font Size */}
        <div>
          <label className="text-[11px] text-ide-muted block mb-1.5">Font Size</label>
          <div className="flex items-center gap-2">
            <input
              type="range" min={10} max={24} step={1}
              value={settings.fontSize}
              onChange={e => updateSettings({ fontSize: Number(e.target.value) })}
              className="flex-1 accent-ide-accent"
            />
            <span className="text-xs font-mono text-ide-text w-6 text-right">{settings.fontSize}</span>
          </div>
        </div>

        {/* Tab Size */}
        <div>
          <label className="text-[11px] text-ide-muted block mb-1.5">Tab Size</label>
          <div className="flex gap-1.5">
            {[2, 4, 8].map(n => (
              <button
                key={n}
                onClick={() => updateSettings({ tabSize: n })}
                className={cn(
                  'flex-1 py-1 rounded text-xs font-mono transition-colors',
                  settings.tabSize === n
                    ? 'bg-ide-accent/20 text-ide-accent border border-ide-accent/40'
                    : 'bg-ide-bg text-ide-muted hover:text-ide-text border border-ide-border'
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        {([
          ['wordWrap',     'Word Wrap'],
          ['minimap',      'Minimap'],
          ['lineNumbers',  'Line Numbers'],
          ['fontLigatures','Font Ligatures'],
        ] as [keyof typeof settings, string][]).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-xs text-ide-text">{label}</span>
            <button
              onClick={() => updateSettings({ [key]: !settings[key] })}
              className={cn(
                'w-9 h-5 rounded-full transition-colors relative flex-shrink-0',
                settings[key] ? 'bg-ide-accent' : 'bg-ide-border'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                  settings[key] ? 'translate-x-4' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────
export function Sidebar({ activeView }: { activeView: string }) {
  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 240, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeInOut' }}
      className="h-full bg-ide-surface border-r border-ide-border overflow-hidden flex-shrink-0"
    >
      <div className="w-60 h-full">
        {activeView === 'collab'    ? <CollabView />    :
         activeView === 'search'    ? <SearchView />    :
         activeView === 'settings'  ? <SettingsView />  :
         <ExplorerView />}
      </div>
    </motion.div>
  );
}
