
export interface ComplexityMetrics {
  notation: string;
  max_depth: number;
  loop_count: number;
  explanation: string;
}

export interface ExecutionResult {
  output: string;
  error: string;
  complexity: ComplexityMetrics | null;
}

export interface EditorState {
  code: string;
  output: string;
  error: string;
  metrics: ComplexityMetrics | null;
  isRunning: boolean;
  connectedUsers: string[];
}
