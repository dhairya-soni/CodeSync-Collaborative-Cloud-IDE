import React from 'react';
import Editor, { OnChange } from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language = 'python' }) => {
  const handleEditorChange: OnChange = (val) => {
    onChange(val || '');
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0d1117]">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={handleEditorChange}
        options={{
          fontSize: 13,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          minimap: { enabled: true, side: 'right' },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12 },
          cursorBlinking: "smooth",
          lineHeight: 1.5,
          renderLineHighlight: "all",
          bracketPairColorization: { enabled: true },
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10
          },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-[#0d1117] text-[#484f58] text-xs font-bold animate-pulse">
            LOADING KERNEL...
          </div>
        }
      />
    </div>
  );
};