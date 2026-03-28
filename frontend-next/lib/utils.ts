import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Language } from './store';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Language display labels — no emojis
export const LANG_LABELS: Record<Language, string> = {
  python:     'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  go:         'Go',
  cpp:        'C++',
  java:       'Java',
  rust:       'Rust',
};

// Short badge text
export const LANG_SHORT: Record<Language, string> = {
  python:     'PY',
  javascript: 'JS',
  typescript: 'TS',
  go:         'Go',
  cpp:        'C++',
  java:       'Java',
  rust:       'RS',
};

// File extension
export const LANG_EXT: Record<Language, string> = {
  python:     'py',
  javascript: 'js',
  typescript: 'ts',
  go:         'go',
  cpp:        'cpp',
  java:       'java',
  rust:       'rs',
};

// Brand colours per language
export const LANG_COLORS: Record<Language, string> = {
  python:     '#4B8BBE',
  javascript: '#F0DB4F',
  typescript: '#3178C6',
  go:         '#00ACD7',
  cpp:        '#6866FB',
  java:       '#ED8B00',
  rust:       '#CE412B',
};

// Monaco language identifiers
export const MONACO_LANG: Record<Language, string> = {
  python:     'python',
  javascript: 'javascript',
  typescript: 'typescript',
  go:         'go',
  cpp:        'cpp',
  java:       'java',
  rust:       'rust',
};

export function getMonacoLanguage(lang: Language): string {
  return MONACO_LANG[lang] ?? 'plaintext';
}

export function getFileExtension(lang: Language): string {
  return LANG_EXT[lang] ?? 'txt';
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/** Return a deterministic colour for a peer based on their ID */
export function generatePeerColor(seed: string): string {
  const palette = ['#58a6ff', '#bc8cff', '#3fb950', '#ffa657', '#79c0ff', '#f78166', '#d2a8ff'];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Map a Big-O string to a colour on the green → red spectrum */
export function getBigOColor(bigO: string): string {
  if (bigO.includes('1'))            return '#3fb950'; // green
  if (bigO.includes('log n') && !bigO.includes('n log')) return '#79c0ff'; // cyan
  if (bigO === 'O(n)')               return '#58a6ff'; // blue
  if (bigO.includes('n log'))        return '#d29922'; // yellow
  if (bigO.includes('n²') || bigO.includes('n^2')) return '#ffa657'; // orange
  if (bigO.includes('2ⁿ') || bigO.includes('2^')) return '#f85149'; // red
  return '#f85149';                                   // red default
}

export function cn2(...inputs: ClassValue[]) {
  return clsx(inputs);
}
