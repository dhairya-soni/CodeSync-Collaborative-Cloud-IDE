export class SocketManager {
  private socket: WebSocket | null = null;
  private callbacks: Array<(code: string) => void> = [];
  private roomId: string;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.connect();
  }

  private connect() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/${this.roomId}`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'CODE_UPDATE') {
          this.callbacks.forEach(cb => cb(data.code));
        }
      };
    } catch (e) {
      console.warn('WebSocket connection failed.');
    }
  }

  public subscribeToUpdates(callback: (code: string) => void) {
    this.callbacks.push(callback);
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