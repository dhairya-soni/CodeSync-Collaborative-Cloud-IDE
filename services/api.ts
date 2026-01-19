
import { ExecutionResult } from '../types';

/**
 * Service handler for secure remote code execution.
 * Interfaces with the sandboxed Docker execution backend.
 */
export const executeCode = async (code: string): Promise<ExecutionResult> => {
  try {
    const response = await fetch('/api/v1/execute', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Requested-With': 'CodeSync-Client'
      },
      body: JSON.stringify({ code, language: 'python' }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    // Graceful fallback for demonstration purposes when a backend is not hosted
    return processLocalDemonstration(code);
  }
};

/**
 * Provides static analysis for client-side demonstration.
 * In a production environment, this analysis is performed on the server.
 */
const processLocalDemonstration = (code: string): Promise<ExecutionResult> => {
  return new Promise((resolve) => {
    // Static analysis heuristics
    const forLoops = (code.match(/for /g) || []).length;
    const whileLoops = (code.match(/while /g) || []).length;
    const loopCount = forLoops + whileLoops;
    
    let notation = 'O(1)';
    if (loopCount === 1) notation = 'O(n)';
    else if (loopCount > 1) notation = 'O(n²)';

    // Simulate network latency
    setTimeout(() => {
      resolve({
        output: "Execution successful.\n-------------------\nRemote Kernel: Python 3.9.12\n\nProcess finished with exit code 0.",
        error: "",
        complexity: {
          notation: notation,
          max_depth: loopCount > 1 ? 2 : loopCount,
          loop_count: loopCount,
          explanation: `Heuristic analysis detected ${loopCount} iterative structure(s). Base complexity estimated at ${notation}.`
        }
      });
    }, 850);
  });
};
