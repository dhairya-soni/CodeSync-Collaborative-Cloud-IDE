
import React from 'react';
import { ComplexityMetrics } from '../types';

interface ComplexityProps {
  metrics: ComplexityMetrics | null;
}

export const Complexity: React.FC<ComplexityProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="bg-[#161b22] rounded p-6 border border-[#30363d] text-center">
        <p className="text-[#484f58] text-[11px] uppercase font-bold tracking-widest">Waiting for Data</p>
      </div>
    );
  }

  const getComplexityColor = (notation: string) => {
    if (notation.includes('O(1)') || notation.includes('O(log n)')) return 'text-emerald-400';
    if (notation.includes('O(n)')) return 'text-sky-400';
    if (notation.includes('O(n log n)')) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="bg-[#161b22] rounded p-5 border border-[#30363d] space-y-5">
      <div className="flex flex-col gap-1">
        <span className="text-[#8b949e] text-[10px] font-bold uppercase tracking-wider">Estimated Time Complexity</span>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-black font-mono tracking-tighter ${getComplexityColor(metrics.notation)}`}>
            {metrics.notation}
          </span>
          <div className="h-1 flex-1 bg-[#30363d] rounded-full overflow-hidden">
             <div className={`h-full ${metrics.notation.includes('n') ? 'w-2/3 bg-sky-500' : 'w-1/4 bg-emerald-500'}`}></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0d1117] p-3 rounded border border-[#30363d] shadow-sm">
          <div className="text-[9px] text-[#8b949e] font-bold uppercase mb-1 tracking-tighter">Nested Depth</div>
          <div className="text-lg font-bold text-white">{metrics.max_depth}</div>
        </div>
        <div className="bg-[#0d1117] p-3 rounded border border-[#30363d] shadow-sm">
          <div className="text-[9px] text-[#8b949e] font-bold uppercase mb-1 tracking-tighter">Loop Count</div>
          <div className="text-lg font-bold text-white">{metrics.loop_count}</div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#30363d]">
        <h4 className="text-[10px] font-bold text-[#8b949e] uppercase mb-1.5 tracking-tighter">System Insight</h4>
        <p className="text-[11px] text-[#c9d1d9] leading-relaxed italic">
          "{metrics.explanation}"
        </p>
      </div>
    </div>
  );
};
