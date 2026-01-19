import React from 'react';
import { ProjectFile } from '../types';

interface SidebarProps {
  files: ProjectFile[];
  activeFileId: string;
  onFileSelect: (id: string) => void;
  onNewFile: () => void;
  onDeleteFile: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ files, activeFileId, onFileSelect, onNewFile, onDeleteFile }) => {
  return (
    <div className="w-full h-full flex flex-col bg-[#161b22] border-r border-[#30363d] select-none text-[#8b949e]">
      {/* Explorer Title */}
      <div className="p-3 pb-2 flex items-center justify-between group">
        <span className="text-[11px] font-bold uppercase tracking-wider">Explorer</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={onNewFile}
            className="p-1 hover:bg-[#30363d] rounded transition-colors"
            title="New File"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Workspace Root Header */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#c9d1d9] px-3 py-1.5 bg-[#21262d]/40 border-y border-[#30363d]">
          <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
          CODESYNC-PROJECT
        </div>
        
        <div className="mt-1">
          {files.map(file => (
            <div 
              key={file.id}
              onClick={() => onFileSelect(file.id)}
              className={`group flex items-center justify-between pl-6 pr-2 py-1.5 cursor-pointer transition-colors ${
                activeFileId === file.id 
                  ? 'bg-[#21262d] text-[#58a6ff] border-l-2 border-[#58a6ff]' 
                  : 'hover:bg-[#1f242c] hover:text-[#c9d1d9]'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {file.name.endsWith('.py') ? (
                  <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.25.75c-2.69 0-2.531 2.332-2.531 2.332v2.108h2.558v.35H10.59c-1.636 0-3.146.903-3.146 2.532v4.204c0 1.63 1.258 3.12 2.887 3.12h1.66v-2.332c0-2.69 2.332-2.531 2.332-2.531h4.22c1.63 0 3.093-1.432 3.093-3.061V4.41c0-1.63-1.428-3.061-3.057-3.061H14.25zm-1.59 1.136c.402 0 .727.325.727.727a.726.726 0 1 1-.727-.727zM6.91 8.411c-1.63 0-3.057 1.428-3.057 3.061v3.136c0 1.63 1.428 3.061 3.057 3.061h4.22c2.69 0 2.531-2.332 2.531-2.332v-2.108H11.1v-.35h3.673c1.63 0 3.146-.903 3.146-2.532v-4.204c0-1.63-1.258-3.12-2.887-3.12h-1.66v2.332c0 2.69-2.332 2.531-2.332 2.531h-4.22zm2.127 8.182c.402 0 .727.325.727.727a.726.726 0 1 1-.727-.727z"/>
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM13 3.5L18.5 9H13V3.5z"></path></svg>
                )}
                <span className="text-xs truncate font-medium">{file.name}</span>
              </div>
              {files.length > 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};