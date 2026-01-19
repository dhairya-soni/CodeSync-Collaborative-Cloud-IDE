
/**
 * Manages WebSocket synchronization for collaborative editing.
 * Uses a mock implementation if the server is not present.
 */
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
      // Assuming the backend is hosted alongside or provides a WS endpoint
      const wsUrl = `ws://${window.location.host}/ws/${this.roomId}`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'CODE_UPDATE') {
          this.callbacks.forEach(cb => cb(data.code));
        }
      };
    } catch (e) {
      console.warn('WebSocket connection failed. Running in single-user mode.');
    }
  }

  public subscribeToUpdates(callback: (code: string) => void) {
    this.callbacks.push(callback);
  }

  public emitCodeChange(code: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'CODE_UPDATE',
        code: code
      }));
    }
  }

  public disconnect() {
    this.socket?.close();
  }
}
