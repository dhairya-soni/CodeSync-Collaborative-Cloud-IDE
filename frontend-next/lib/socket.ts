import type { SyncStatus } from './store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export interface CursorUpdate {
  userId: string;
  name:   string;
  color:  string;
  line:   number;
  column: number;
}

// 'action' instead of 'type' to avoid conflict with WS discriminator field
export interface ActivityEvent {
  id:        string;
  userId:    string;
  name:      string;
  color:     string;
  action:    'joined' | 'left' | 'ran' | 'edited';
  timestamp: number;
}

type Handler<T> = (data: T) => void;

export class SocketManager {
  private ws: WebSocket | null = null;
  private readonly roomId: string;

  private codeHandlers:     Handler<string>[]         = [];
  private statusHandlers:   Handler<SyncStatus>[]     = [];
  private peerHandlers:     Handler<string[]>[]        = [];
  private cursorHandlers:   Handler<CursorUpdate>[]   = [];
  private activityHandlers: Handler<ActivityEvent>[]  = [];

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnects = 5;
  private manuallyClosed = false;

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  connect() {
    this.manuallyClosed = false;
    this.emitStatus('connecting');
    try {
      this.ws = new WebSocket(`${WS_URL}/ws/${this.roomId}`);
      this.ws.onopen    = () => { this.reconnectAttempts = 0; this.emitStatus('connected'); };
      this.ws.onmessage = (e) => this.handleMessage(e.data);
      this.ws.onclose   = () => { if (!this.manuallyClosed) { this.emitStatus('disconnected'); this.scheduleReconnect(); } };
      this.ws.onerror   = () => this.emitStatus('error');
    } catch {
      this.emitStatus('error');
    }
  }

  private handleMessage(raw: string) {
    try {
      const msg = JSON.parse(raw);
      switch (msg.type) {
        case 'CODE_UPDATE':
          this.codeHandlers.forEach(h => h(msg.code));
          break;
        case 'PEER_LIST':
          this.peerHandlers.forEach(h => h(msg.peers));
          break;
        case 'CURSOR_UPDATE':
          this.cursorHandlers.forEach(h => h(msg as CursorUpdate));
          break;
        case 'ACTIVITY':
          // Reconstruct ActivityEvent from wire format
          this.activityHandlers.forEach(h => h({
            id:        msg.userId + msg.timestamp,
            userId:    msg.userId,
            name:      msg.name,
            color:     msg.color,
            action:    msg.action,
            timestamp: msg.timestamp,
          }));
          break;
      }
    } catch { /* ignore malformed messages */ }
  }

  private emitStatus(s: SyncStatus) {
    this.statusHandlers.forEach(h => h(s));
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnects) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30_000);
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private send(data: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  sendCodeUpdate(code: string) {
    this.send({ type: 'CODE_UPDATE', code });
  }

  sendCursorUpdate(c: CursorUpdate) {
    this.send({ type: 'CURSOR_UPDATE', ...c });
  }

  sendActivity(ev: { userId: string; name: string; color: string; action: ActivityEvent['action'] }) {
    this.send({ type: 'ACTIVITY', ...ev, timestamp: Date.now() });
  }

  onCodeUpdate(h: Handler<string>)         { this.codeHandlers.push(h);     return () => { this.codeHandlers     = this.codeHandlers.filter(x => x !== h); }; }
  onStatusChange(h: Handler<SyncStatus>)   { this.statusHandlers.push(h);   return () => { this.statusHandlers   = this.statusHandlers.filter(x => x !== h); }; }
  onPeerUpdate(h: Handler<string[]>)       { this.peerHandlers.push(h);     return () => { this.peerHandlers     = this.peerHandlers.filter(x => x !== h); }; }
  onCursorUpdate(h: Handler<CursorUpdate>){ this.cursorHandlers.push(h);   return () => { this.cursorHandlers   = this.cursorHandlers.filter(x => x !== h); }; }
  onActivity(h: Handler<ActivityEvent>)    { this.activityHandlers.push(h); return () => { this.activityHandlers = this.activityHandlers.filter(x => x !== h); }; }

  disconnect() {
    this.manuallyClosed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }

  get isConnected() { return this.ws?.readyState === WebSocket.OPEN; }
}
