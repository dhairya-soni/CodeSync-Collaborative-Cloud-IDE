export interface ComplexityMetrics {
  notation: string;
  max_depth: number;
  loop_count: number;
  explanation: string;
  nodes_scanned: number; // New: Numeric proof of AST depth
}

export interface SystemTelemetry {
  sync_latency: number;
  memory_usage: string;
  container_id: string;
  execution_time: number;
}

export interface ExecutionResult {
  output: string;
  error: string;
  complexity: ComplexityMetrics | null;
  telemetry?: SystemTelemetry; // New: Performance data for demo
}

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

export interface EditorState {
  files: ProjectFile[];
  activeFileId: string;
  output: string;
  error: string;
  metrics: ComplexityMetrics | null;
  telemetry: SystemTelemetry | null;
  isRunning: boolean;
  connectedUsers: string[];
}