
import React from 'react';

interface TerminalProps {
  output: string;
  error: string;
}

export const Terminal: React.FC<TerminalProps> = ({ output, error }) => {
  if (!output && !error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#484f58] border border-[#30363d] rounded bg-[#0d1117] border-dashed">
        <svg className="w-8 h-8 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <p className="text-[11px] font-medium uppercase tracking-wider">Ready for execution</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#010409] rounded border border-[#30363d] p-3 font-mono text-[13px] leading-relaxed overflow-y-auto shadow-inner custom-scrollbar">
      {error && (
        <div className="text-[#f85149] mb-3">
          <div className="font-bold text-[10px] mb-1 opacity-80 uppercase">[Runtime Error]</div>
          <div className="whitespace-pre-wrap pl-2 border-l-2 border-[#f85149]">{error}</div>
        </div>
      )}
      {output && (
        <div className="text-[#c9d1d9]">
          <div className="font-bold text-[10px] mb-1 text-[#238636] opacity-80 uppercase">[Output Stream]</div>
          <div className="whitespace-pre-wrap pl-2 border-l-2 border-[#238636]">{output}</div>
        </div>
      )}
    </div>
  );
};
