
import React, { useRef } from 'react';
import Editor, { OnChange } from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange }) => {
  const handleEditorChange: OnChange = (val) => {
    onChange(val || '');
  };

  return (
    <div className="w-full h-full">
      <Editor
        height="100%"
        defaultLanguage="python"
        theme="vs-dark"
        value={value}
        onChange={handleEditorChange}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
          cursorBlinking: "smooth",
          lineHeight: 1.6,
          renderLineHighlight: "all",
          bracketPairColorization: { enabled: true },
        }}
        loading={<div className="flex items-center justify-center h-full bg-[#0d1117] text-blue-500 font-bold">Initializing Engine...</div>}
      />
    </div>
  );
};
