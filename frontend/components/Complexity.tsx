import React from 'react';
import { ComplexityMetrics } from '../types';

interface ComplexityProps {
  metrics: ComplexityMetrics | null;
}

export const Complexity: React.FC<ComplexityProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="bg-[#161b22] rounded-lg p-8 border border-[#30363d] text-center border-dashed">
        <p className="text-[#484f58] text-[10px] uppercase font-bold tracking-widest">Awaiting Analysis</p>
      </div>
    );
  }

  const getComplexityTheme = (notation: string) => {
    if (notation.includes('1') || notation.includes('log')) return { color: 'text-emerald-400', bar: 'bg-emerald-500', width: '20%' };
    if (notation.includes('n²')) return { color: 'text-orange-400', bar: 'bg-orange-500', width: '80%' };
    return { color: 'text-sky-400', bar: 'bg-sky-500', width: '50%' };
  };

  const theme = getComplexityTheme(metrics.notation);

  return (
    <div className="space-y-4">
      <div className="bg-[#161b22] rounded-xl p-5 border border-[#30363d] space-y-4 shadow-xl">
        <div>
          <span className="text-[#8b949e] text-[9px] font-bold uppercase tracking-widest opacity-60">Theoretical Performance</span>
          <div className="text-3xl font-black font-mono tracking-tighter mt-1">
            <span className={theme.color}>{metrics.notation}</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d]">
            <div className={`h-full transition-all duration-1000 ease-out ${theme.bar}`} style={{ width: theme.width }}></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
            <div className="text-[8px] text-[#484f58] uppercase font-bold mb-1">AST Nodes Scanned</div>
            <div className="text-lg font-bold text-white font-mono">{Math.floor(metrics.nodes_scanned)}</div>
          </div>
          <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
            <div className="text-[8px] text-[#484f58] uppercase font-bold mb-1">Max Depth</div>
            <div className="text-lg font-bold text-white font-mono">{metrics.max_depth}</div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#30363d]">
          <p className="text-[11px] text-[#c9d1d9] leading-relaxed italic opacity-80">
            "{metrics.explanation}"
          </p>
        </div>
      </div>
    </div>
  );
};