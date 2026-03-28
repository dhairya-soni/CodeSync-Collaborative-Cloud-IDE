'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, Code2, ChevronDown, Share2, Loader2, Lock } from 'lucide-react';
import { useEditorStore, type Language } from '@/lib/store';
import { LANG_LABELS, LANG_SHORT, LANG_COLORS, cn } from '@/lib/utils';
import { toast } from 'sonner';

const LANGUAGES: Language[] = ['python', 'javascript', 'typescript', 'go', 'cpp', 'java', 'rust'];

interface ToolbarProps { onRun: () => void; }

function LangDot({ lang }: { lang: Language }) {
  return <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: LANG_COLORS[lang] }} />;
}

export function Toolbar({ onRun }: ToolbarProps) {
  const { language, setLanguage, isRunning, peers, syncStatus, roomId, roomPin } = useEditorStore();
  const [langOpen, setLangOpen]   = useState(false);
  const [pinOpen,  setPinOpen]    = useState(false);
  const [copied,   setCopied]     = useState(false);

  const copyLink = () => {
    const url = `${window.location.origin}/editor?room=${roomId}&pin=${roomPin}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Room link copied!', { description: `PIN: ${roomPin}` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between px-4 h-10 bg-ide-surface border-b border-ide-border flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Code2 className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-bold text-ide-text hidden md:block">
            Code<span className="text-ide-accent">Sync</span>
          </span>
        </div>

        <div className="w-px h-4 bg-ide-border" />

        {/* Language picker */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-2 py-1 rounded text-xs text-ide-muted hover:text-ide-text hover:bg-ide-bg transition-colors"
          >
            <LangDot lang={language} />
            <span>{LANG_LABELS[language]}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          <AnimatePresence>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                  className="absolute top-full left-0 mt-1 w-44 bg-ide-surface border border-ide-border rounded-lg shadow-xl z-50 overflow-hidden py-1"
                >
                  {LANGUAGES.map(l => (
                    <button
                      key={l}
                      onClick={() => { setLanguage(l); setLangOpen(false); }}
                      className={cn(
                        'flex items-center gap-2.5 w-full px-3 py-2 text-xs transition-colors',
                        language === l ? 'text-ide-text bg-ide-bg' : 'text-ide-muted hover:text-ide-text hover:bg-ide-bg/60'
                      )}
                    >
                      <LangDot lang={l} />
                      <span className="flex-1 text-left">{LANG_LABELS[l]}</span>
                      <span className="text-[10px] font-mono opacity-50">{LANG_SHORT[l]}</span>
                      {language === l && <Check className="w-3 h-3 text-ide-accent ml-1" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Peer avatars */}
        {peers.length > 0 && (
          <div className="flex items-center -space-x-2 mr-1">
            {peers.slice(0, 4).map(peer => (
              <div
                key={peer.id}
                title={peer.name}
                className="w-6 h-6 rounded-full border-2 border-ide-surface flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: peer.color }}
              >
                {peer.initials}
              </div>
            ))}
            {peers.length > 4 && (
              <div className="w-6 h-6 rounded-full border-2 border-ide-surface bg-ide-bg flex items-center justify-center text-[9px] text-ide-muted">
                +{peers.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Sync dot */}
        <div
          title={`Sync: ${syncStatus}`}
          className={cn('w-2 h-2 rounded-full', {
            'bg-green-400 animate-pulse': syncStatus === 'connected',
            'bg-yellow-400 animate-pulse': syncStatus === 'connecting',
            'bg-red-400': syncStatus === 'error',
            'bg-ide-muted': syncStatus === 'disconnected',
          })}
        />

        {/* Room PIN button */}
        <button
          onClick={() => setPinOpen(!pinOpen)}
          title="Room PIN"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-ide-border text-ide-muted hover:text-ide-text hover:border-ide-accent/40 transition-all text-xs"
        >
          <Lock className="w-3 h-3" />
          <span className="font-mono font-bold tracking-widest text-ide-text">{roomPin}</span>
        </button>

        {/* Share link */}
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ide-border text-ide-muted hover:text-ide-text hover:border-ide-accent/40 transition-all text-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:block">{copied ? 'Copied!' : 'Share'}</span>
        </button>

        {/* Run */}
        <button
          onClick={onRun}
          disabled={isRunning}
          className={cn(
            'flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
            isRunning
              ? 'bg-ide-surface text-ide-muted cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 shadow-[0_0_12px_rgba(63,185,80,0.3)]'
          )}
        >
          {isRunning
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running…</>
            : <><Play className="w-3.5 h-3.5 fill-current" /> Run</>
          }
        </button>
      </div>
    </div>
  );
}
