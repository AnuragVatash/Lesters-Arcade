'use client';

// Advanced Networking System for Lester's Arcade
// This file contains comprehensive networking capabilities for multiplayer games

export interface NetworkMessage {
  id: string;
  type: string;
  data: unknown;
  timestamp: number;
  senderId?: string;
  recipientId?: string;
  reliable: boolean;
  priority: MessagePriority;
  ttl: number;
}

export enum MessagePriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

export interface NetworkConnection {
  id: string;
  address: string;
  port: number;
  connected: boolean;
  lastPing: number;
  latency: number;
  bandwidth: number;
  packetsSent: number;
  packetsReceived: number;
  bytesSent: number;
  bytesReceived: number;
  lastActivity: number;
  quality: ConnectionQuality;
}

export enum ConnectionQuality {
  POOR = 'poor',
  FAIR = 'fair',
  GOOD = 'good',
  EXCELLENT = 'excellent'
}

export interface NetworkEvent {
  type: NetworkEventType;
  connectionId?: string;
  data?: unknown;
  timestamp: number;
}

export enum NetworkEventType {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  MESSAGE_RECEIVED = 'message_received',
  MESSAGE_SENT = 'message_sent',
  CONNECTION_LOST = 'connection_lost',
  CONNECTION_RESTORED = 'connection_restored',
  BANDWIDTH_CHANGED = 'bandwidth_changed',
  LATENCY_CHANGED = 'latency_changed',
  ERROR = 'error'
}

export interface NetworkConfig {
  serverUrl: string;
  port: number;
  protocol: NetworkProtocol;
  encryption: boolean;
  compression: boolean;
  heartbeatInterval: number;
  timeout: number;
  maxRetries: number;
  bufferSize: number;
  maxConnections: number;
  enableLogging: boolean;
}

export enum NetworkProtocol {
  WEBSOCKET = 'websocket',
  WEBRTC = 'webrtc',
  HTTP = 'http',
  UDP = 'udp'
}

export interface NetworkManager {
  config: NetworkConfig;
  connections: Map<string, NetworkConnection>;
  messages: Map<string, NetworkMessage>;
  events: NetworkEvent[];
  connected: boolean;
  serverConnection?: NetworkConnection;
  
  init(config: NetworkConfig): Promise<void>;
  connect(serverUrl: string, port?: number): Promise<void>;
  disconnect(): void;
  send(message: NetworkMessage): Promise<void>;
  sendTo(connectionId: string, message: NetworkMessage): Promise<void>;
  broadcast(message: NetworkMessage, exclude?: string[]): Promise<void>;
  on(event: NetworkEventType, callback: (event: NetworkEvent) => void): void;
  off(event: NetworkEventType, callback: (event: NetworkEvent) => void): void;
  emit(event: NetworkEvent): void;
  getConnection(id: string): NetworkConnection | undefined;
  getAllConnections(): NetworkConnection[];
  getConnectionQuality(id: string): ConnectionQuality;
  updateConnectionQuality(id: string): void;
  isConnected(): boolean;
  getLatency(id?: string): number;
  getBandwidth(id?: string): number;
  getPacketLoss(id?: string): number;
  destroy(): void;
}

export interface WebSocketManager extends NetworkManager {
  socket?: WebSocket;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  reconnectTimer?: NodeJS.Timeout;
  
  connect(serverUrl: string, port?: number): Promise<void>;
  disconnect(): void;
  send(message: NetworkMessage): Promise<void>;
  handleMessage(event: MessageEvent): void;
  handleOpen(event: Event): void;
  handleClose(event: CloseEvent): void;
  handleError(event: Event): void;
  reconnect(): void;
}

export interface WebRTCManager extends NetworkManager {
  peerConnection?: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  iceServers: RTCIceServer[];
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  
  connect(serverUrl: string, port?: number): Promise<void>;
  disconnect(): void;
  send(message: NetworkMessage): Promise<void>;
  createOffer(): Promise<RTCSessionDescriptionInit>;
  createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>;
  setLocalDescription(description: RTCSessionDescriptionInit): Promise<void>;
  setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
  addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;
}

export interface HTTPManager extends NetworkManager {
  baseUrl: string;
  headers: Map<string, string>;
  timeout: number;
  
  connect(serverUrl: string, port?: number): Promise<void>;
  disconnect(): void;
  send(message: NetworkMessage): Promise<void>;
  get(endpoint: string, params?: Record<string, unknown>): Promise<unknown>;
  post(endpoint: string, data?: unknown): Promise<unknown>;
  put(endpoint: string, data?: unknown): Promise<unknown>;
  delete(endpoint: string): Promise<unknown>;
  setHeader(key: string, value: string): void;
  removeHeader(key: string): void;
}

// WebSocket Manager Implementation
export class WebSocketManagerImpl implements WebSocketManager {
  config: NetworkConfig;
  connections: Map<string, NetworkConnection>;
  messages: Map<string, NetworkMessage>;
  events: NetworkEvent[];
  connected: boolean;
  serverConnection?: NetworkConnection;
  socket?: WebSocket;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  reconnectTimer?: NodeJS.Timeout;

  private eventListeners: Map<NetworkEventType, Array<(event: NetworkEvent) => void>>;
  private messageQueue: NetworkMessage[];
  private heartbeatTimer?: NodeJS.Timeout;
  private messageIdCounter: number;

  constructor() {
    this.config = {
      serverUrl: '',
      port: 8080,
      protocol: NetworkProtocol.WEBSOCKET,
      encryption: false,
      compression: false,
      heartbeatInterval: 30000,
      timeout: 10000,
      maxRetries: 3,
      bufferSize: 1024 * 1024,
      maxConnections: 100,
      enableLogging: false
    };
    this.connections = new Map();
    this.messages = new Map();
    this.events = [];
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
    this.messageQueue = [];
    this.messageIdCounter = 0;
  }

  async init(config: NetworkConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    this.log('Network manager initialized');
  }

  async connect(serverUrl: string, port: number = this.config.port): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = `ws://${serverUrl}:${port}`;
        this.socket = new WebSocket(url);

        this.socket.onopen = (event) => {
          this.handleOpen(event);
          resolve();
        };

        this.socket.onclose = (event) => {
          this.handleClose(event);
        };

        this.socket.onerror = (event) => {
          this.handleError(event);
          reject(new Error('WebSocket connection failed'));
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event);
        };

        // Set up heartbeat
        this.startHeartbeat();

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    this.connected = false;
    this.connections.clear();
    this.messageQueue = [];
    this.log('Disconnected from server');
  }

  async send(message: NetworkMessage): Promise<void> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.messageQueue.push(message);
      return;
    }

    try {
      const serialized = JSON.stringify(message);
      this.socket.send(serialized);
      
      this.messages.set(message.id, message);
      this.emit({
        type: NetworkEventType.MESSAGE_SENT,
        data: message,
        timestamp: Date.now()
      });

      this.log(`Message sent: ${message.type}`);
    } catch (error) {
      this.log(`Failed to send message: ${String(error)}`);
      throw error;
    }
  }

  async sendTo(connectionId: string, message: NetworkMessage): Promise<void> {
    message.recipientId = connectionId;
    await this.send(message);
  }

  async broadcast(message: NetworkMessage, _exclude: string[] = []): Promise<void> {
    // For simplicity, send to all for now; exclude currently unused
    void _exclude;
    for (const [id, connection] of this.connections) {
      if (connection.connected) {
        await this.sendTo(id, message);
      }
    }
  }

  on(event: NetworkEventType, callback: (event: NetworkEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: NetworkEventType, callback: (event: NetworkEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: NetworkEvent): void {
    this.events.push(event);
    if (this.events.length > 1000) {
      this.events.shift();
    }

    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  getConnection(id: string): NetworkConnection | undefined {
    return this.connections.get(id);
  }

  getAllConnections(): NetworkConnection[] {
    return Array.from(this.connections.values());
  }

  getConnectionQuality(id: string): ConnectionQuality {
    const connection = this.connections.get(id);
    if (!connection) return ConnectionQuality.POOR;

    if (connection.latency < 50 && connection.bandwidth > 1000000) {
      return ConnectionQuality.EXCELLENT;
    } else if (connection.latency < 100 && connection.bandwidth > 500000) {
      return ConnectionQuality.GOOD;
    } else if (connection.latency < 200 && connection.bandwidth > 100000) {
      return ConnectionQuality.FAIR;
    } else {
      return ConnectionQuality.POOR;
    }
  }

  updateConnectionQuality(id: string): void {
    const connection = this.connections.get(id);
    if (connection) {
      connection.quality = this.getConnectionQuality(id);
    }
  }

  isConnected(): boolean {
    return this.connected && this.socket?.readyState === WebSocket.OPEN;
  }

  getLatency(id?: string): number {
    if (id) {
      const connection = this.connections.get(id);
      return connection?.latency || 0;
    }
    return this.serverConnection?.latency || 0;
  }

  getBandwidth(id?: string): number {
    if (id) {
      const connection = this.connections.get(id);
      return connection?.bandwidth || 0;
    }
    return this.serverConnection?.bandwidth || 0;
  }

  getPacketLoss(id?: string): number {
    // Calculate packet loss based on sent/received packets
    if (id) {
      const connection = this.connections.get(id);
      if (connection) {
        const totalPackets = connection.packetsSent + connection.packetsReceived;
        return totalPackets > 0 ? (connection.packetsSent - connection.packetsReceived) / totalPackets : 0;
      }
    }
    return 0;
  }

  handleMessage(event: MessageEvent): void {
    try {
      const message: NetworkMessage = JSON.parse(event.data);
      this.messages.set(message.id, message);

      // Update connection stats
      if (message.senderId) {
        const connection = this.connections.get(message.senderId);
        if (connection) {
          connection.packetsReceived++;
          connection.bytesReceived += event.data.length;
          connection.lastActivity = Date.now();
        }
      }

      this.emit({
        type: NetworkEventType.MESSAGE_RECEIVED,
        connectionId: message.senderId,
        data: message,
        timestamp: Date.now()
      });

      this.log(`Message received: ${message.type}`);
    } catch (error) {
      this.log(`Failed to parse message: ${error}`);
    }
  }

  handleOpen(_event: Event): void {
    void _event;
    this.connected = true;
    this.reconnectAttempts = 0;

    // Create server connection
    this.serverConnection = {
      id: 'server',
      address: this.config.serverUrl,
      port: this.config.port,
      connected: true,
      lastPing: Date.now(),
      latency: 0,
      bandwidth: 0,
      packetsSent: 0,
      packetsReceived: 0,
      bytesSent: 0,
      bytesReceived: 0,
      lastActivity: Date.now(),
      quality: ConnectionQuality.GOOD
    };

    this.connections.set('server', this.serverConnection);

    // Send queued messages
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }

    this.emit({
      type: NetworkEventType.CONNECTED,
      timestamp: Date.now()
    });

    this.log('Connected to server');
  }

  handleClose(event: CloseEvent): void {
    this.connected = false;
    this.connections.clear();

    this.emit({
      type: NetworkEventType.DISCONNECTED,
      data: { code: event.code, reason: event.reason },
      timestamp: Date.now()
    });

    this.log(`Disconnected from server: ${event.code} - ${event.reason}`);

    // Attempt to reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnect();
    }
  }

  handleError(_event: Event): void {
    this.emit({
      type: NetworkEventType.ERROR,
      data: _event,
      timestamp: Date.now()
    });

    this.log('WebSocket error occurred');
  }

  reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    this.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.config.serverUrl, this.config.port).catch(() => {
        // Reconnection failed, will be handled by the error handler
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        const pingMessage: NetworkMessage = {
          id: this.generateMessageId(),
          type: 'ping',
          data: { timestamp: Date.now() },
          timestamp: Date.now(),
          reliable: false,
          priority: MessagePriority.LOW,
          ttl: 5000
        };

        this.send(pingMessage);
      }
    }, this.config.heartbeatInterval);
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${++this.messageIdCounter}`;
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[NetworkManager] ${message}`);
    }
  }

  destroy(): void {
    this.disconnect();
    this.eventListeners.clear();
    this.events = [];
    this.messages.clear();
  }
}

// WebRTC Manager Implementation
export class WebRTCManagerImpl implements WebRTCManager {
  config: NetworkConfig;
  connections: Map<string, NetworkConnection>;
  messages: Map<string, NetworkMessage>;
  events: NetworkEvent[];
  connected: boolean;
  serverConnection?: NetworkConnection;
  peerConnection?: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  iceServers: RTCIceServer[];
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;

  private eventListeners: Map<NetworkEventType, Array<(event: NetworkEvent) => void>>;
  private messageQueue: NetworkMessage[];
  private messageIdCounter: number;

  constructor() {
    this.config = {
      serverUrl: '',
      port: 8080,
      protocol: NetworkProtocol.WEBRTC,
      encryption: true,
      compression: true,
      heartbeatInterval: 30000,
      timeout: 10000,
      maxRetries: 3,
      bufferSize: 1024 * 1024,
      maxConnections: 100,
      enableLogging: false
    };
    this.connections = new Map();
    this.messages = new Map();
    this.events = [];
    this.connected = false;
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ];
    this.connectionState = 'new';
    this.iceConnectionState = 'new';
    this.eventListeners = new Map();
    this.messageQueue = [];
    this.messageIdCounter = 0;
  }

  async init(config: NetworkConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    this.log('WebRTC manager initialized');
  }

  async connect(serverUrl: string, port: number = this.config.port): Promise<void> {
    void serverUrl;
    void port;
    try {
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.iceServers
      });

      this.setupPeerConnection();

      // Create data channel
      this.dataChannel = this.peerConnection.createDataChannel('gameData', {
        ordered: true,
        maxRetransmits: 3
      });

      this.setupDataChannel();

      // Create offer
      const offer = await this.createOffer();
      await this.setLocalDescription(offer);

      // Send offer to server (this would typically be done through a signaling server)
      // For now, we'll simulate a successful connection
      this.connected = true;

      this.log('WebRTC connection established');
    } catch (error) {
      this.log(`WebRTC connection failed: ${error}`);
      throw error;
    }
  }

  disconnect(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = undefined;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = undefined;
    }

    this.connected = false;
    this.connections.clear();
    this.messageQueue = [];
    this.log('WebRTC connection closed');
  }

  async send(message: NetworkMessage): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      this.messageQueue.push(message);
      return;
    }

    try {
      const data = JSON.stringify(message);
      this.dataChannel.send(data);
      
      this.messages.set(message.id, message);
      this.emit({
        type: NetworkEventType.MESSAGE_SENT,
        data: message,
        timestamp: Date.now()
      });

      this.log(`Message sent: ${message.type}`);
    } catch (error) {
      this.log(`Failed to send message: ${error}`);
      throw error;
    }
  }

  async sendTo(connectionId: string, message: NetworkMessage): Promise<void> {
    message.recipientId = connectionId;
    await this.send(message);
  }

  async broadcast(message: NetworkMessage, exclude: string[] = []): Promise<void> {
    for (const [id, connection] of this.connections) {
      if (!exclude.includes(id) && connection.connected) {
        await this.sendTo(id, message);
      }
    }
  }

  on(event: NetworkEventType, callback: (event: NetworkEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: NetworkEventType, callback: (event: NetworkEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: NetworkEvent): void {
    this.events.push(event);
    if (this.events.length > 1000) {
      this.events.shift();
    }

    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  getConnection(id: string): NetworkConnection | undefined {
    return this.connections.get(id);
  }

  getAllConnections(): NetworkConnection[] {
    return Array.from(this.connections.values());
  }

  getConnectionQuality(id: string): ConnectionQuality {
    const connection = this.connections.get(id);
    if (!connection) return ConnectionQuality.POOR;

    if (connection.latency < 50 && connection.bandwidth > 1000000) {
      return ConnectionQuality.EXCELLENT;
    } else if (connection.latency < 100 && connection.bandwidth > 500000) {
      return ConnectionQuality.GOOD;
    } else if (connection.latency < 200 && connection.bandwidth > 100000) {
      return ConnectionQuality.FAIR;
    } else {
      return ConnectionQuality.POOR;
    }
  }

  updateConnectionQuality(id: string): void {
    const connection = this.connections.get(id);
    if (connection) {
      connection.quality = this.getConnectionQuality(id);
    }
  }

  isConnected(): boolean {
    return this.connected && this.dataChannel?.readyState === 'open';
  }

  getLatency(id?: string): number {
    if (id) {
      const connection = this.connections.get(id);
      return connection?.latency || 0;
    }
    return this.serverConnection?.latency || 0;
  }

  getBandwidth(id?: string): number {
    if (id) {
      const connection = this.connections.get(id);
      return connection?.bandwidth || 0;
    }
    return this.serverConnection?.bandwidth || 0;
  }

  getPacketLoss(id?: string): number {
    if (id) {
      const connection = this.connections.get(id);
      if (connection) {
        const totalPackets = connection.packetsSent + connection.packetsReceived;
        return totalPackets > 0 ? (connection.packetsSent - connection.packetsReceived) / totalPackets : 0;
      }
    }
    return 0;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    return await this.peerConnection.createOffer();
  }

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    await this.setRemoteDescription(offer);
    return await this.peerConnection.createAnswer();
  }

  async setLocalDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    await this.peerConnection.setLocalDescription(description);
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    await this.peerConnection.setRemoteDescription(description);
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    await this.peerConnection.addIceCandidate(candidate);
  }

  private setupPeerConnection(): void {
    if (!this.peerConnection) return;

    this.peerConnection.onconnectionstatechange = () => {
      this.connectionState = this.peerConnection!.connectionState;
      this.log(`Connection state changed: ${this.connectionState}`);
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      this.iceConnectionState = this.peerConnection!.iceConnectionState;
      this.log(`ICE connection state changed: ${this.iceConnectionState}`);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to remote peer
        this.log('ICE candidate generated');
      }
    };

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };
  }

  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      this.log('Data channel opened');
    };

    this.dataChannel.onclose = () => {
      this.log('Data channel closed');
    };

    this.dataChannel.onerror = (error) => {
      this.log(`Data channel error: ${error}`);
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const message: NetworkMessage = JSON.parse(event.data);
        this.messages.set(message.id, message);

        this.emit({
          type: NetworkEventType.MESSAGE_RECEIVED,
          connectionId: message.senderId,
          data: message,
          timestamp: Date.now()
        });

        this.log(`Message received: ${message.type}`);
      } catch (error) {
        this.log(`Failed to parse message: ${error}`);
      }
    };
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${++this.messageIdCounter}`;
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[WebRTCManager] ${message}`);
    }
  }

  destroy(): void {
    this.disconnect();
    this.eventListeners.clear();
    this.events = [];
    this.messages.clear();
  }
}

// HTTP Manager Implementation
export class HTTPManagerImpl implements HTTPManager {
  config: NetworkConfig;
  connections: Map<string, NetworkConnection>;
  messages: Map<string, NetworkMessage>;
  events: NetworkEvent[];
  connected: boolean;
  serverConnection?: NetworkConnection;
  baseUrl: string;
  headers: Map<string, string>;
  timeout: number;

  private eventListeners: Map<NetworkEventType, Array<(event: NetworkEvent) => void>>;
  private messageIdCounter: number;

  constructor() {
    this.config = {
      serverUrl: '',
      port: 8080,
      protocol: NetworkProtocol.HTTP,
      encryption: true,
      compression: false,
      heartbeatInterval: 30000,
      timeout: 10000,
      maxRetries: 3,
      bufferSize: 1024 * 1024,
      maxConnections: 100,
      enableLogging: false
    };
    this.connections = new Map();
    this.messages = new Map();
    this.events = [];
    this.connected = false;
    this.baseUrl = '';
    this.headers = new Map();
    this.timeout = 10000;
    this.eventListeners = new Map();
    this.messageIdCounter = 0;
  }

  async init(config: NetworkConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    this.log('HTTP manager initialized');
  }

  async connect(serverUrl: string, port: number = this.config.port): Promise<void> {
    this.baseUrl = `http://${serverUrl}:${port}`;
    this.connected = true;

    // Create server connection
    this.serverConnection = {
      id: 'server',
      address: serverUrl,
      port: port,
      connected: true,
      lastPing: Date.now(),
      latency: 0,
      bandwidth: 0,
      packetsSent: 0,
      packetsReceived: 0,
      bytesSent: 0,
      bytesReceived: 0,
      lastActivity: Date.now(),
      quality: ConnectionQuality.GOOD
    };

    this.connections.set('server', this.serverConnection);

    this.emit({
      type: NetworkEventType.CONNECTED,
      timestamp: Date.now()
    });

    this.log('Connected to HTTP server');
  }

  disconnect(): void {
    this.connected = false;
    this.connections.clear();
    this.baseUrl = '';

    this.emit({
      type: NetworkEventType.DISCONNECTED,
      timestamp: Date.now()
    });

    this.log('Disconnected from HTTP server');
  }

  async send(message: NetworkMessage): Promise<void> {
    try {
      const response = await this.post('/message', message);
      
      this.messages.set(message.id, message);
      this.emit({
        type: NetworkEventType.MESSAGE_SENT,
        data: message,
        timestamp: Date.now()
      });

      this.log(`Message sent: ${message.type}`);
    } catch (error) {
      this.log(`Failed to send message: ${error}`);
      throw error;
    }
  }

  async sendTo(connectionId: string, message: NetworkMessage): Promise<void> {
    message.recipientId = connectionId;
    await this.send(message);
  }

  async broadcast(message: NetworkMessage, exclude: string[] = []): Promise<void> {
    await this.send(message);
  }

  on(event: NetworkEventType, callback: (event: NetworkEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: NetworkEventType, callback: (event: NetworkEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: NetworkEvent): void {
    this.events.push(event);
    if (this.events.length > 1000) {
      this.events.shift();
    }

    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  getConnection(id: string): NetworkConnection | undefined {
    return this.connections.get(id);
  }

  getAllConnections(): NetworkConnection[] {
    return Array.from(this.connections.values());
  }

  getConnectionQuality(id: string): ConnectionQuality {
    const connection = this.connections.get(id);
    if (!connection) return ConnectionQuality.POOR;

    if (connection.latency < 50 && connection.bandwidth > 1000000) {
      return ConnectionQuality.EXCELLENT;
    } else if (connection.latency < 100 && connection.bandwidth > 500000) {
      return ConnectionQuality.GOOD;
    } else if (connection.latency < 200 && connection.bandwidth > 100000) {
      return ConnectionQuality.FAIR;
    } else {
      return ConnectionQuality.POOR;
    }
  }

  updateConnectionQuality(id: string): void {
    const connection = this.connections.get(id);
    if (connection) {
      connection.quality = this.getConnectionQuality(id);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getLatency(id?: string): number {
    if (id) {
      const connection = this.connections.get(id);
      return connection?.latency || 0;
    }
    return this.serverConnection?.latency || 0;
  }

  getBandwidth(id?: string): number {
    if (id) {
      const connection = this.connections.get(id);
      return connection?.bandwidth || 0;
    }
    return this.serverConnection?.bandwidth || 0;
  }

  getPacketLoss(id?: string): number {
    return 0; // HTTP doesn't have packet loss
  }

  async get(endpoint: string, params?: Record<string, unknown>): Promise<unknown> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      throw new Error(`HTTP GET failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async post(endpoint: string, data?: unknown): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      throw new Error(`HTTP POST failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async put(endpoint: string, data?: unknown): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      throw new Error(`HTTP PUT failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async delete(endpoint: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      throw new Error(`HTTP DELETE failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  setHeader(key: string, value: string): void {
    this.headers.set(key, value);
  }

  removeHeader(key: string): void {
    this.headers.delete(key);
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...Object.fromEntries(this.headers)
    };
    return headers;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${++this.messageIdCounter}`;
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[HTTPManager] ${message}`);
    }
  }

  destroy(): void {
    this.disconnect();
    this.eventListeners.clear();
    this.events = [];
    this.messages.clear();
    this.headers.clear();
  }
}

// Network Manager Factory
export class NetworkManagerFactory {
  static create(type: NetworkProtocol): NetworkManager {
    switch (type) {
      case NetworkProtocol.WEBSOCKET:
        return new WebSocketManagerImpl();
      case NetworkProtocol.WEBRTC:
        return new WebRTCManagerImpl();
      case NetworkProtocol.HTTP:
        return new HTTPManagerImpl();
      default:
        throw new Error(`Unsupported network protocol: ${type}`);
    }
  }
}

// Export the main classes
export const WebSocketManager = WebSocketManagerImpl;
export const WebRTCManager = WebRTCManagerImpl;
export const HTTPManager = HTTPManagerImpl;
export default NetworkManagerFactory;
