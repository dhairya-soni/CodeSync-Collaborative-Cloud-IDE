import React from 'react';

interface TerminalProps {
  output: string;
  error: string;
}

export const Terminal: React.FC<TerminalProps> = ({ output, error }) => {
  if (!output && !error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#484f58] border border-[#30363d] rounded bg-[#0d1117] border-dashed">
        <p className="text-[11px] font-medium uppercase">Ready for execution</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#010409] rounded border border-[#30363d] p-3 font-mono text-[13px] leading-relaxed overflow-y-auto">
      {error && <div className="text-[#f85149] mb-3 whitespace-pre-wrap">{error}</div>}
      {output && <div className="text-[#c9d1d9] whitespace-pre-wrap">{output}</div>}
    </div>
  );
};