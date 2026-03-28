'use client';

import { useRef, useCallback, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useEditorStore } from '@/lib/store';
import { getMonacoLanguage } from '@/lib/utils';
import type { SocketManager, CursorUpdate } from '@/lib/socket';

interface Props {
  socketRef: React.MutableRefObject<SocketManager | null>;
  isReceiving: React.MutableRefObject<boolean>;
  userId: string;
  userName: string;
  userColor: string;
}

// Peer cursor widgets keyed by userId
const cursorWidgets = new Map<string, any>();

export function MonacoEditor({ socketRef, isReceiving, userId, userName, userColor }: Props) {
  const { getActiveFile, updateActiveFile, language, updatePeerCursor, peerCursors, settings } = useEditorStore();
  const editorRef  = useRef<any>(null);
  const monacoRef  = useRef<any>(null);
  const prevFileId = useRef<string | undefined>(undefined);
  const decorIds   = useRef<string[]>([]);

  // ── Mount ────────────────────────────────────────────────────
  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current  = editor;
    monacoRef.current  = monaco;

    // GitHub dark theme
    monaco.editor.defineTheme('github-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment',   foreground: '8b949e', fontStyle: 'italic' },
        { token: 'keyword',   foreground: 'ff7b72' },
        { token: 'string',    foreground: 'a5d6ff' },
        { token: 'number',    foreground: '79c0ff' },
        { token: 'type',      foreground: 'ffa657' },
        { token: 'function',  foreground: 'd2a8ff' },
        { token: 'operator',  foreground: 'ff7b72' },
        { token: 'class',     foreground: 'ffa657', fontStyle: 'bold' },
      ],
      colors: {
        'editor.background':                  '#0d1117',
        'editor.foreground':                  '#e6edf3',
        'editor.lineHighlightBackground':     '#161b22',
        'editor.selectionBackground':         '#388bfd26',
        'editor.inactiveSelectionBackground': '#388bfd1a',
        'editorCursor.foreground':            '#58a6ff',
        'editorLineNumber.foreground':        '#484f58',
        'editorLineNumber.activeForeground':  '#8b949e',
        'editorIndentGuide.background1':      '#30363d',
        'editorIndentGuide.activeBackground1':'#484f58',
        'editorBracketMatch.background':      '#388bfd26',
        'editorBracketMatch.border':          '#388bfd',
        'scrollbarSlider.background':         '#30363d80',
        'editorGutter.background':            '#0d1117',
        'minimap.background':                 '#0d1117',
      },
    });
    monaco.editor.setTheme('github-dark');

    // Track our own cursor and broadcast it
    editor.onDidChangeCursorPosition((e) => {
      const { lineNumber: line, column } = e.position;
      socketRef.current?.sendCursorUpdate({ userId, name: userName, color: userColor, line, column });
    });

    editor.focus();
  };

  // ── Content change ──────────────────────────────────────────
  const handleChange = useCallback((value: string | undefined) => {
    if (isReceiving.current) return;
    const code = value ?? '';
    updateActiveFile(code);
    socketRef.current?.sendCodeUpdate(code);
  }, [updateActiveFile, socketRef, isReceiving]);

  // ── Sync file content on tab switch ─────────────────────────
  const file = getActiveFile();
  useEffect(() => {
    if (!editorRef.current || !file) return;
    if (prevFileId.current === file.id) return;
    prevFileId.current = file.id;
    const model = editorRef.current.getModel();
    if (model && model.getValue() !== file.content) {
      model.setValue(file.content);
    }
  }, [file?.id]);

  // ── Render peer cursors as Monaco content widgets ────────────
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    // Remove old widgets
    cursorWidgets.forEach((widget) => editor.removeContentWidget(widget));
    cursorWidgets.clear();

    peerCursors.forEach((cursor) => {
      const domNode = document.createElement('div');
      domNode.style.cssText = `
        position: relative;
        display: inline-block;
        pointer-events: none;
      `;

      // Cursor line
      const line = document.createElement('div');
      line.style.cssText = `
        width: 2px;
        height: 18px;
        background: ${cursor.color};
        display: inline-block;
        position: absolute;
        top: 0;
        left: 0;
      `;

      // Name label
      const label = document.createElement('div');
      label.innerText = cursor.name;
      label.style.cssText = `
        position: absolute;
        top: -18px;
        left: 0;
        background: ${cursor.color};
        color: #fff;
        font-size: 10px;
        font-weight: 600;
        font-family: var(--font-inter, sans-serif);
        padding: 1px 5px;
        border-radius: 3px;
        white-space: nowrap;
        pointer-events: none;
        line-height: 16px;
      `;

      domNode.appendChild(line);
      domNode.appendChild(label);

      const widget = {
        getId:      () => `peer-cursor-${cursor.userId}`,
        getDomNode: () => domNode,
        getPosition: () => ({
          position: { lineNumber: cursor.line, column: cursor.column },
          preference: [0], // EXACT
        }),
      };

      cursorWidgets.set(cursor.userId, widget);
      editor.addContentWidget(widget);
    });

    return () => {
      cursorWidgets.forEach((widget) => editor.removeContentWidget(widget));
      cursorWidgets.clear();
    };
  }, [peerCursors]);

  return (
    <div className="flex-1 min-h-0 overflow-hidden">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        value={file?.content ?? ''}
        onChange={handleChange}
        onMount={handleMount}
        theme="github-dark"
        options={{
          fontSize: settings.fontSize,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontLigatures: settings.fontLigatures,
          lineHeight: Math.round(settings.fontSize * 1.6),
          minimap: { enabled: settings.minimap, scale: 1, renderCharacters: false },
          lineNumbers: settings.lineNumbers ? 'on' : 'off',
          scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6, useShadows: false },
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true, indentation: true },
          quickSuggestions: true,
          wordWrap: settings.wordWrap ? 'on' : 'off',
          tabSize: settings.tabSize,
          insertSpaces: true,
          formatOnPaste: true,
          autoIndent: 'advanced',
          showFoldingControls: 'always',
          overviewRulerBorder: false,
          renderWhitespace: 'none',
          selectionHighlight: true,
          occurrencesHighlight: 'singleFile',
          codeLens: false,
          contextmenu: true,
          mouseWheelZoom: true,
          accessibilitySupport: 'off',
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-ide-bg">
            <div className="w-6 h-6 border-2 border-ide-accent border-t-transparent rounded-full animate-spin" />
          </div>
        }
      />
    </div>
  );
}
