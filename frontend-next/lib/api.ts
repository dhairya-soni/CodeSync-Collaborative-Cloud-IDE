import type { Language, ExecutionResult } from './store';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function executeCode(code: string, language: Language): Promise<ExecutionResult> {
  // Try the real backend first
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      throw new Error(err.detail ?? `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    const isNetworkError =
      err.name === 'TimeoutError' ||
      err.name === 'AbortError' ||
      err.message?.includes('fetch') ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('NetworkError') ||
      err.message?.includes('ECONNREFUSED');

    // For JS/TS, run in-browser as fallback (great for demos without a backend)
    if (isNetworkError && (language === 'javascript' || language === 'typescript')) {
      return runInBrowser(code);
    }

    // For all other languages, explain clearly
    if (isNetworkError) {
      return {
        output: '',
        error: backendDownMessage(language),
        duration_ms: 0,
      };
    }

    return { output: '', error: err.message ?? 'Unknown error', duration_ms: 0 };
  }
}

// ── In-browser JS execution (demo/offline mode) ───────────────
function runInBrowser(code: string): ExecutionResult {
  const logs: string[] = [];
  const errors: string[] = [];
  const t0 = performance.now();

  const fakeConsole = {
    log:   (...a: any[]) => logs.push(a.map(stringify).join(' ')),
    error: (...a: any[]) => errors.push(a.map(stringify).join(' ')),
    warn:  (...a: any[]) => logs.push('[warn] ' + a.map(stringify).join(' ')),
    info:  (...a: any[]) => logs.push(a.map(stringify).join(' ')),
    table: (...a: any[]) => logs.push(JSON.stringify(a[0], null, 2)),
  };

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('console', code);
    fn(fakeConsole);
    const ms = Math.round(performance.now() - t0);
    return {
      output: logs.join('\n'),
      error: errors.length ? errors.join('\n') : '',
      duration_ms: ms,
    };
  } catch (e: any) {
    return {
      output: logs.join('\n'),
      error: e?.message ?? String(e),
      duration_ms: Math.round(performance.now() - t0),
    };
  }
}

function stringify(v: unknown): string {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'object') {
    try { return JSON.stringify(v, null, 2); } catch { return String(v); }
  }
  return String(v);
}

function backendDownMessage(language: Language): string {
  return (
    `Backend not reachable at ${BACKEND_URL}\n\n` +
    `To run ${language} code, start the backend:\n\n` +
    `  cd backend\n` +
    `  pip install fastapi uvicorn docker\n` +
    `  uvicorn app.main:app --reload --port 8000\n\n` +
    `Then make sure Docker Desktop is running for sandboxed execution.`
  );
}
