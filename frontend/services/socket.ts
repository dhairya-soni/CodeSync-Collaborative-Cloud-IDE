export class SocketManager {
  private socket: WebSocket | null = null;
  private callbacks: Array<(code: string) => void> = [];
  private statusCallbacks: Array<(status: 'connecting' | 'connected' | 'error' | 'closed') => void> = [];
  private roomId: string;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.connect();
  }

  private connect() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Use direct window.location.host which is proxied by Vite
      const wsUrl = `${protocol}//${window.location.host}/ws/${this.roomId}`;
      
      console.info(`[Socket] Attempting connection to ${wsUrl}`);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.info('[Socket] Connection Established');
        this.statusCallbacks.forEach(cb => cb('connected'));
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'CODE_UPDATE') {
            this.callbacks.forEach(cb => cb(data.code));
          }
        } catch (e) {
          console.warn('[Socket] Received malformed message');
        }
      };

      this.socket.onerror = () => {
        console.error('[Socket] Connection Error');
        this.statusCallbacks.forEach(cb => cb('error'));
      };

      this.socket.onclose = () => {
        console.info('[Socket] Connection Closed');
        this.statusCallbacks.forEach(cb => cb('closed'));
      };

    } catch (e) {
      console.error('[Socket] Critical Setup Error:', e);
    }
  }

  public subscribeToUpdates(callback: (code: string) => void) {
    this.callbacks.push(callback);
  }

  public onStatusChange(callback: (status: 'connecting' | 'connected' | 'error' | 'closed') => void) {
    this.statusCallbacks.push(callback);
    // Trigger current status if already set
    if (this.socket?.readyState === WebSocket.OPEN) callback('connected');
  }

  public emitCodeChange(code: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'CODE_UPDATE', code }));
    }
  }

  public disconnect() {
    this.socket?.close();
  }
}