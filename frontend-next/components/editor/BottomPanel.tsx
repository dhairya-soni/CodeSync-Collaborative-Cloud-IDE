'use client';

import { motion } from 'framer-motion';
import { Terminal, Cpu, AlertCircle, ChevronDown, Loader2, Database, CheckCircle2 } from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { getBigOColor, formatDuration, cn } from '@/lib/utils';

const TABS = [
  { id: 'output'     as const, label: 'Output',     icon: Terminal    },
  { id: 'complexity' as const, label: 'Complexity', icon: Cpu         },
  { id: 'problems'   as const, label: 'Problems',   icon: AlertCircle },
];

export function BottomPanel() {
  const {
    activePanel, setActivePanel,
    bottomPanelOpen, toggleBottomPanel,
    result, isRunning,
  } = useEditorStore();

  return (
    <div
      className="border-t border-ide-border bg-ide-surface flex flex-col flex-shrink-0 transition-all duration-200"
      style={{ height: bottomPanelOpen ? 260 : 33 }}
    >
      {/* Tab bar */}
      <div className="flex items-center h-[33px] border-b border-ide-border flex-shrink-0">
        <div className="flex items-center flex-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive  = activePanel === id && bottomPanelOpen;
            const hasErr    = id === 'problems' && result?.error;
            const hasBigO   = id === 'complexity' && result?.complexity && !result.error;
            return (
              <button
                key={id}
                onClick={() => isActive ? toggleBottomPanel() : setActivePanel(id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 h-full text-xs border-r border-ide-border transition-colors',
                  isActive ? 'text-ide-text bg-ide-bg border-b border-b-ide-accent' : 'text-ide-muted hover:text-ide-text hover:bg-ide-bg/40'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {hasErr && (
                  <span className="ml-1 px-1.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold leading-4">1</span>
                )}
                {hasBigO && (
                  <span
                    className="ml-1 px-1.5 rounded text-[10px] font-bold font-mono leading-4"
                    style={{
                      color:      getBigOColor(result!.complexity!.big_o),
                      background: getBigOColor(result!.complexity!.big_o) + '22',
                    }}
                  >
                    {result!.complexity!.big_o}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pr-3">
          {result && !isRunning && (
            <span className="text-xs text-ide-muted font-mono">{formatDuration(result.duration_ms)}</span>
          )}
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-ide-accent">
              <Loader2 className="w-3 h-3 animate-spin" /> Running…
            </span>
          )}
          <button onClick={toggleBottomPanel} className="p-1 rounded text-ide-muted hover:text-ide-text transition-colors">
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', bottomPanelOpen ? '' : 'rotate-180')} />
          </button>
        </div>
      </div>

      {/* Content */}
      {bottomPanelOpen && (
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {isRunning ? (
            <div className="flex items-center gap-3 text-sm text-ide-muted">
              <div className="w-4 h-4 border-2 border-ide-accent border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span className="font-mono">Executing in Docker sandbox…</span>
            </div>
          ) : activePanel === 'output' ? <OutputPanel />
            : activePanel === 'complexity' ? <ComplexityPanel />
            : <ProblemsPanel />}
        </div>
      )}
    </div>
  );
}

// ── Output ────────────────────────────────────────────────────
function OutputPanel() {
  const { result } = useEditorStore();
  if (!result) return (
    <div className="font-mono text-sm text-ide-muted">
      <span className="text-ide-accent">$</span>
      <span className="ml-2">
        Press <kbd className="px-1.5 py-0.5 rounded bg-ide-bg border border-ide-border text-xs">Ctrl+Enter</kbd> or click <strong>Run</strong> to execute
      </span>
    </div>
  );
  return (
    <div className="font-mono text-sm space-y-1">
      {result.output && <pre className="text-green-400 whitespace-pre-wrap leading-relaxed">{result.output}</pre>}
      {result.error  && <pre className="text-red-400 whitespace-pre-wrap leading-relaxed">{result.error}</pre>}
      {!result.output && !result.error && <span className="text-ide-muted italic">(no output)</span>}
    </div>
  );
}

// ── Complexity ────────────────────────────────────────────────
function ComplexityPanel() {
  const { result } = useEditorStore();
  if (!result?.complexity) return (
    <p className="text-sm text-ide-muted">
      {result ? 'Complexity analysis is available for Python only.' : 'Run your Python code to see complexity analysis.'}
    </p>
  );

  const c = result.complexity;
  const timeColor  = getBigOColor(c.big_o);
  const spaceColor = getBigOColor(c.space_complexity);

  const pct = (notation: string) => {
    if (notation.includes('1'))   return 8;
    if (notation.includes('log n') && !notation.includes('n log')) return 22;
    if (notation === 'O(n)')      return 40;
    if (notation.includes('n log')) return 58;
    if (notation.includes('n²') || notation.includes('n^2')) return 75;
    return 92;
  };

  return (
    <div className="space-y-5">
      {/* Time */}
      <div>
        <div className="text-[11px] font-semibold text-ide-muted uppercase tracking-wider mb-2">Time Complexity</div>
        <div className="flex items-center gap-4">
          <div className="text-2xl font-black font-mono" style={{ color: timeColor }}>{c.big_o}</div>
          <div className="flex-1">
            <div className="flex justify-between text-[10px] text-ide-muted mb-1">
              <span>O(1)</span><span>O(log n)</span><span>O(n)</span><span>O(n²)</span><span>O(2ⁿ)</span>
            </div>
            <div className="h-1.5 bg-ide-bg rounded-full overflow-hidden border border-ide-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct(c.big_o)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #3fb950, ${timeColor})` }}
              />
            </div>
          </div>
        </div>
        <p className="text-[11px] text-ide-muted mt-2 leading-relaxed">{c.explanation}</p>
      </div>

      {/* Space */}
      <div className="border-t border-ide-border pt-4">
        <div className="text-[11px] font-semibold text-ide-muted uppercase tracking-wider mb-2">Space Complexity</div>
        <div className="flex items-center gap-4">
          <div className="text-2xl font-black font-mono" style={{ color: spaceColor }}>{c.space_complexity}</div>
          <div className="flex-1">
            <div className="h-1.5 bg-ide-bg rounded-full overflow-hidden border border-ide-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct(c.space_complexity)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #3fb950, ${spaceColor})` }}
              />
            </div>
          </div>
        </div>
        <p className="text-[11px] text-ide-muted mt-2 leading-relaxed">{c.space_explanation}</p>
      </div>

      {/* Metadata badges */}
      <div className="flex flex-wrap gap-2 border-t border-ide-border pt-3">
        {[
          { label: 'Loop Depth', value: c.loop_depth.toString(),  color: '#58a6ff' },
          { label: 'Loops',      value: c.loop_count.toString(),  color: '#bc8cff' },
          { label: 'Recursive',  value: c.has_recursion ? 'Yes' : 'No', color: c.has_recursion ? '#ffa657' : '#3fb950' },
          { label: 'Sort Used',  value: c.has_sort     ? 'Yes' : 'No', color: c.has_sort     ? '#d29922' : '#3fb950' },
        ].map(({ label, value, color }) => (
          <div key={label} className="px-3 py-1.5 rounded-lg bg-ide-bg border border-ide-border">
            <div className="text-[10px] text-ide-muted">{label}</div>
            <div className="text-sm font-bold font-mono" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Problems ──────────────────────────────────────────────────
function ProblemsPanel() {
  const { result } = useEditorStore();
  if (!result) return <div className="text-sm text-ide-muted">No problems. Run your code to check for errors.</div>;
  if (!result.error) return (
    <div className="flex items-center gap-2 text-sm text-green-400">
      <CheckCircle2 className="w-4 h-4" />
      No problems detected
    </div>
  );
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-xs font-semibold text-red-400 mb-1">Error</div>
        <pre className="text-xs text-red-400/90 whitespace-pre-wrap leading-relaxed font-mono">{result.error}</pre>
      </div>
    </div>
  );
}
