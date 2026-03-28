import { create } from 'zustand';
import { LANG_EXT } from './utils';

export type Language = 'python' | 'javascript' | 'typescript' | 'go' | 'cpp' | 'java' | 'rust';
export type PanelTab = 'output' | 'problems' | 'complexity';
export type SyncStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface FolderNode {
  id: string;
  name: string;
  type: 'folder';
  children: (FolderNode | FileTab)[];
  expanded: boolean;
}

export interface FileTab {
  id: string;
  name: string;
  language: Language;
  content: string;
  isDirty: boolean;
  folderId?: string;   // parent folder id, undefined = root
}

export interface Peer {
  id: string;
  name: string;
  color: string;
  initials: string;
}

export interface PeerCursor {
  userId: string;
  name: string;
  color: string;
  line: number;
  column: number;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  name: string;
  color: string;
  action: 'joined' | 'left' | 'ran' | 'edited';
  timestamp: number;
}

export interface EditorSettings {
  fontSize:    number;
  tabSize:     number;
  wordWrap:    boolean;
  minimap:     boolean;
  lineNumbers: boolean;
  fontLigatures: boolean;
}

export interface ExecutionResult {
  output: string;
  error: string;
  duration_ms: number;
  complexity?: {
    big_o: string;
    loop_depth: number;
    loop_count: number;
    explanation: string;
    space_complexity: string;
    space_explanation: string;
    has_recursion: boolean;
    has_sort: boolean;
  };
}

// ── Starter code per language ─────────────────────────────────
const STARTER: Record<Language, string> = {
  python: `# CodeSync — Collaborative Cloud IDE
# Share the room link and code together in real time

def merge_sort(arr: list) -> list:
    """O(n log n) — divide and conquer sorting."""
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left  = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left: list, right: list) -> list:
    result, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    return result + left[i:] + right[j:]

data = [38, 27, 43, 3, 9, 82, 10]
print("Input: ", data)
print("Sorted:", merge_sort(data))
`,
  javascript: `// CodeSync — Collaborative Cloud IDE
// Share the room link and code together in real time

function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}

const data = [38, 27, 43, 3, 9, 82, 10];
console.log('Input: ', data.join(', '));
console.log('Sorted:', mergeSort(data).join(', '));
`,
  typescript: `// CodeSync — Collaborative Cloud IDE
function mergeSort<T>(arr: T[], cmp: (a: T, b: T) => number = (a, b) => (a > b ? 1 : -1)): T[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  return merge(mergeSort(arr.slice(0, mid), cmp), mergeSort(arr.slice(mid), cmp), cmp);
}

function merge<T>(left: T[], right: T[], cmp: (a: T, b: T) => number): T[] {
  const result: T[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    result.push(cmp(left[i], right[j]) <= 0 ? left[i++] : right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}

const nums = [38, 27, 43, 3, 9, 82, 10];
console.log('Sorted:', mergeSort(nums).join(', '));
`,
  go: `// CodeSync — Collaborative Cloud IDE
package main

import "fmt"

func mergeSort(arr []int) []int {
	if len(arr) <= 1 { return arr }
	mid := len(arr) / 2
	return merge(mergeSort(arr[:mid]), mergeSort(arr[mid:]))
}

func merge(left, right []int) []int {
	result := []int{}
	i, j := 0, 0
	for i < len(left) && j < len(right) {
		if left[i] <= right[j] { result = append(result, left[i]); i++ } else { result = append(result, right[j]); j++ }
	}
	return append(append(result, left[i:]...), right[j:]...)
}

func main() {
	data := []int{38, 27, 43, 3, 9, 82, 10}
	fmt.Println("Input: ", data)
	fmt.Println("Sorted:", mergeSort(data))
}
`,
  cpp: `// CodeSync — Collaborative Cloud IDE
#include <iostream>
#include <vector>
using namespace std;

vector<int> merge(vector<int> l, vector<int> r) {
    vector<int> res; int i=0,j=0;
    while(i<l.size()&&j<r.size()) res.push_back(l[i]<=r[j]?l[i++]:r[j++]);
    while(i<l.size()) res.push_back(l[i++]);
    while(j<r.size()) res.push_back(r[j++]);
    return res;
}

vector<int> mergeSort(vector<int> a) {
    if(a.size()<=1) return a;
    int mid=a.size()/2;
    return merge(mergeSort({a.begin(),a.begin()+mid}),mergeSort({a.begin()+mid,a.end()}));
}

int main(){
    vector<int> data={38,27,43,3,9,82,10};
    auto sorted=mergeSort(data);
    for(int x:sorted) cout<<x<<" ";
    return 0;
}
`,
  java: `// CodeSync — Collaborative Cloud IDE
import java.util.Arrays;
public class Main {
    static int[] mergeSort(int[] a) {
        if(a.length<=1) return a;
        int mid=a.length/2;
        return merge(mergeSort(Arrays.copyOfRange(a,0,mid)),mergeSort(Arrays.copyOfRange(a,mid,a.length)));
    }
    static int[] merge(int[] l,int[] r){
        int[] res=new int[l.length+r.length]; int i=0,j=0,k=0;
        while(i<l.length&&j<r.length) res[k++]=l[i]<=r[j]?l[i++]:r[j++];
        while(i<l.length) res[k++]=l[i++];
        while(j<r.length) res[k++]=r[j++];
        return res;
    }
    public static void main(String[] args){
        int[] data={38,27,43,3,9,82,10};
        System.out.println(Arrays.toString(mergeSort(data)));
    }
}
`,
  rust: `// CodeSync — Collaborative Cloud IDE
fn merge_sort(arr: Vec<i32>) -> Vec<i32> {
    if arr.len() <= 1 { return arr; }
    let mid = arr.len() / 2;
    let left  = merge_sort(arr[..mid].to_vec());
    let right = merge_sort(arr[mid..].to_vec());
    merge(left, right)
}

fn merge(left: Vec<i32>, right: Vec<i32>) -> Vec<i32> {
    let (mut i, mut j) = (0, 0);
    let mut result = Vec::new();
    while i < left.len() && j < right.len() {
        if left[i] <= right[j] { result.push(left[i]); i+=1; } else { result.push(right[j]); j+=1; }
    }
    result.extend_from_slice(&left[i..]);
    result.extend_from_slice(&right[j..]);
    result
}

fn main() {
    let data = vec![38, 27, 43, 3, 9, 82, 10];
    println!("{:?}", merge_sort(data));
}
`,
};

// ── Helpers ───────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 10); }

function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── Store interface ───────────────────────────────────────────
interface EditorStore {
  // Files & folders
  files: FileTab[];
  folders: FolderNode[];
  activeFileId: string;

  // Editor settings
  settings: EditorSettings;
  updateSettings: (patch: Partial<EditorSettings>) => void;

  // Language
  language: Language;

  // UI
  sidebarOpen: boolean;
  bottomPanelOpen: boolean;
  activePanel: PanelTab;

  // Execution
  isRunning: boolean;
  result: ExecutionResult | null;

  // Room / collab
  roomId: string;
  roomPin: string;
  syncStatus: SyncStatus;
  peers: Peer[];
  peerCursors: PeerCursor[];
  activityFeed: ActivityEvent[];

  // Actions — files
  setLanguage: (lang: Language) => void;
  updateActiveFile: (content: string) => void;
  setActiveFile: (id: string) => void;
  addFile: (name: string, language: Language, folderId?: string) => void;
  closeFile: (id: string) => void;

  // Actions — folders
  addFolder: (name: string) => void;
  toggleFolder: (id: string) => void;
  deleteFolder: (id: string) => void;

  // Actions — UI
  toggleSidebar: () => void;
  toggleBottomPanel: () => void;
  setActivePanel: (tab: PanelTab) => void;

  // Actions — execution
  setIsRunning: (v: boolean) => void;
  setResult: (r: ExecutionResult | null) => void;

  // Actions — collab
  setSyncStatus: (s: SyncStatus) => void;
  setPeers: (peers: Peer[]) => void;
  updatePeerCursor: (cursor: PeerCursor) => void;
  removePeerCursor: (userId: string) => void;
  pushActivity: (event: Omit<ActivityEvent, 'id'> & { action: ActivityEvent['action'] }) => void;

  // Getters
  getActiveFile: () => FileTab | undefined;
}

const initialLang: Language = 'python';
const initialFile: FileTab = {
  id: 'file-1',
  name: 'main.py',
  language: initialLang,
  content: STARTER[initialLang],
  isDirty: false,
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  files:          [initialFile],
  folders:        [],
  activeFileId:   initialFile.id,
  language:       initialLang,
  sidebarOpen:    true,
  bottomPanelOpen:true,
  activePanel:    'output',
  isRunning:      false,
  result:         null,
  roomId:         uid(),
  roomPin:        generatePin(),
  syncStatus:     'disconnected',
  peers:          [],
  peerCursors:    [],
  activityFeed:   [],

  settings: {
    fontSize:      14,
    tabSize:       4,
    wordWrap:      false,
    minimap:       true,
    lineNumbers:   true,
    fontLigatures: true,
  },
  updateSettings: (patch) => set(s => ({ settings: { ...s.settings, ...patch } })),

  // ── File actions ────────────────────────────────────────────
  setLanguage: (lang) => {
    set(s => ({
      language: lang,
      files: s.files.map(f =>
        f.id === s.activeFileId
          ? { ...f, language: lang, name: `main.${LANG_EXT[lang]}`, content: STARTER[lang] }
          : f
      ),
    }));
  },

  updateActiveFile: (content) =>
    set(s => ({
      files: s.files.map(f => f.id === s.activeFileId ? { ...f, content, isDirty: true } : f),
    })),

  setActiveFile: (id) => {
    const file = get().files.find(f => f.id === id);
    if (file) set({ activeFileId: id, language: file.language });
  },

  addFile: (name, language, folderId) => {
    const id = uid();
    const file: FileTab = { id, name, language, content: STARTER[language], isDirty: false, folderId };
    set(s => ({ files: [...s.files, file], activeFileId: id, language }));
  },

  closeFile: (id) =>
    set(s => {
      const remaining = s.files.filter(f => f.id !== id);
      if (!remaining.length) return s;
      const newActive = s.activeFileId === id ? remaining[remaining.length - 1].id : s.activeFileId;
      const newLang = remaining.find(f => f.id === newActive)?.language ?? s.language;
      return { files: remaining, activeFileId: newActive, language: newLang };
    }),

  // ── Folder actions ──────────────────────────────────────────
  addFolder: (name) => {
    const folder: FolderNode = { id: uid(), name, type: 'folder', children: [], expanded: true };
    set(s => ({ folders: [...s.folders, folder] }));
  },

  toggleFolder: (id) =>
    set(s => ({
      folders: s.folders.map(f => f.id === id ? { ...f, expanded: !f.expanded } : f),
    })),

  deleteFolder: (id) =>
    set(s => ({
      folders: s.folders.filter(f => f.id !== id),
      files: s.files.filter(f => f.folderId !== id),
    })),

  // ── UI actions ──────────────────────────────────────────────
  toggleSidebar:     () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  toggleBottomPanel: () => set(s => ({ bottomPanelOpen: !s.bottomPanelOpen })),
  setActivePanel:    (tab) => set({ activePanel: tab, bottomPanelOpen: true }),

  // ── Execution ───────────────────────────────────────────────
  setIsRunning: (v) => set({ isRunning: v }),
  setResult:    (r) => set({ result: r }),

  // ── Collab ──────────────────────────────────────────────────
  setSyncStatus: (s) => set({ syncStatus: s }),

  setPeers: (peers) => set({ peers }),

  updatePeerCursor: (cursor) =>
    set(s => ({
      peerCursors: [
        ...s.peerCursors.filter(c => c.userId !== cursor.userId),
        cursor,
      ],
    })),

  removePeerCursor: (userId) =>
    set(s => ({ peerCursors: s.peerCursors.filter(c => c.userId !== userId) })),

  pushActivity: (event) =>
    set(s => ({
      activityFeed: [{ ...event, id: uid() } as ActivityEvent, ...s.activityFeed].slice(0, 50),
    })),

  // ── Getters ─────────────────────────────────────────────────
  getActiveFile: () => {
    const s = get();
    return s.files.find(f => f.id === s.activeFileId);
  },
}));

export { STARTER as STARTER_CODE };
