// ============================================================================
// WebSocket Client - Real-time communication with server
// ============================================================================

import {
  WebSocketEvent,
  ConnectionEvent,
  NodeEvent,
  WalletEvent,
  ContractEvent,
  NetworkEvent,
  ErrorEvent,
} from '../types';

// ============================================================================
// WebSocket Client Class
// ============================================================================

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private wsURL: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private isConnecting: boolean = false;
  private shouldReconnect: boolean = true;

  constructor(wsURL: string) {
    this.wsURL = wsURL;
  }

  // ====================================================================
  // Connection Management
  // ====================================================================

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (
        this.isConnecting ||
        (this.ws && this.ws.readyState === WebSocket.OPEN)
      ) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.wsURL);

        this.ws.onopen = () => {
          console.log('🔌 WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emit('connection:established', {
            message: 'Connected to server',
          });
          resolve();
        };

        this.ws.onmessage = event => {
          try {
            const message: WebSocketEvent = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = event => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.emit('connection:closed', {
            code: event.code,
            reason: event.reason,
          });

          if (
            this.shouldReconnect &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = error => {
          console.error('🔌 WebSocket error:', error);
          this.isConnecting = false;
          this.emit('connection:error', {
            error: 'WebSocket connection failed',
          });
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`
    );

    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect().catch(console.error);
      }
    }, delay);
  }

  // ====================================================================
  // Message Handling
  // ====================================================================

  private handleMessage(message: WebSocketEvent): void {
    const { type, data } = message;

    // Emit the specific event type
    this.emit(type, data);

    // Emit generic message event
    this.emit('message', message);
  }

  // ====================================================================
  // Event System
  // ====================================================================

  on<T = unknown>(event: string, listener: (data: T) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off<T = unknown>(event: string, listener: (data: T) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private emit<T = unknown>(event: string, data: T): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(
            `Error in WebSocket event listener for ${event}:`,
            error
          );
        }
      });
    }
  }

  // ====================================================================
  // Specific Event Listeners
  // ====================================================================

  onConnectionEstablished(listener: (data: { message: string }) => void): void {
    this.on('connection:established', listener);
  }

  onConnectionClosed(
    listener: (data: { code: number; reason: string }) => void
  ): void {
    this.on('connection:closed', listener);
  }

  onConnectionError(listener: (data: { error: string }) => void): void {
    this.on('connection:error', listener);
  }

  onNodeStarted(listener: (data: NodeEvent) => void): void {
    this.on('node:started', listener);
  }

  onNodeStopped(listener: (data: NodeEvent) => void): void {
    this.on('node:stopped', listener);
  }

  onNodeStatusChanged(listener: (data: NodeEvent) => void): void {
    this.on('node:status:changed', listener);
  }

  onNodeError(listener: (data: ErrorEvent) => void): void {
    this.on('node:error', listener);
  }

  onWalletCreated(listener: (data: WalletEvent) => void): void {
    this.on('wallet:created', listener);
  }

  onWalletUpdated(listener: (data: WalletEvent) => void): void {
    this.on('wallet:updated', listener);
  }

  onWalletRemoved(listener: (data: { address: string }) => void): void {
    this.on('wallet:removed', listener);
  }

  onWalletSelected(listener: (data: WalletEvent) => void): void {
    this.on('wallet:selected', listener);
  }

  onWalletBalanceUpdated(
    listener: (data: { address: string; balance: string }) => void
  ): void {
    this.on('wallet:balance:updated', listener);
  }

  onContractDeployed(listener: (data: ContractEvent) => void): void {
    this.on('contract:deployed', listener);
  }

  onContractUpdated(listener: (data: ContractEvent) => void): void {
    this.on('contract:updated', listener);
  }

  onContractRemoved(listener: (data: { address: string }) => void): void {
    this.on('contract:removed', listener);
  }

  onContractSelected(listener: (data: ContractEvent) => void): void {
    this.on('contract:selected', listener);
  }

  onContractCalled(
    listener: (data: {
      method: string;
      args: unknown[];
      result: unknown;
      success: boolean;
      error?: string;
    }) => void
  ): void {
    this.on('contract:called', listener);
  }

  onContractEvent(listener: (data: { event: unknown }) => void): void {
    this.on('contract:event', listener);
  }

  onNetworkSwitched(listener: (data: NetworkEvent) => void): void {
    this.on('network:switched', listener);
  }

  onNetworkError(listener: (data: ErrorEvent) => void): void {
    this.on('network:error', listener);
  }

  onError(listener: (data: ErrorEvent) => void): void {
    this.on('error', listener);
  }

  // ====================================================================
  // Utility Methods
  // ====================================================================

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  send(data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }
}
