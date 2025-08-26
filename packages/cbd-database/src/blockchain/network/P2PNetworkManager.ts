/**
 * P2P Network Manager - Phase 6
 * 
 * Implementation of peer-to-peer networking for the CBD blockchain
 * including peer discovery, message routing, consensus communication, and gossip protocol.
 */

import { EventEmitter } from 'events';
import {
  NetworkMessage,
  MessageType,
  Block,
  Transaction,
  ConsensusMessage,
  BlockchainEvents
} from '../types/BlockchainTypes';
import { Logger } from '../../shared/Logger';

interface NetworkConfig {
  listenAddress: string;
  listenPort: number;
  bootstrapPeers: string[];
  maxPeers: number;
  enableDiscovery: boolean;
  protocolVersion: string;
  networkKey?: string;
  enableTLS: boolean;
  heartbeatInterval: number;
  connectionTimeout: number;
  maxMessageSize: number;
}

interface PeerInfo {
  id: string;
  address: string;
  port: number;
  protocolVersion: string;
  isConnected: boolean;
  lastSeen: number;
  latency: number;
  reputation: number;
  capabilities: string[];
  blockHeight?: number;
}

interface NetworkStats {
  connectedPeers: number;
  totalMessages: number;
  messagesSent: number;
  messagesReceived: number;
  bytesTransferred: bigint;
  averageLatency: number;
  networkUptime: number;
}

/**
 * P2P Network Manager for blockchain networking
 */
export class P2PNetworkManager extends EventEmitter {
  private readonly logger: Logger;
  private readonly config: NetworkConfig;
  
  // Peer management
  private peers: Map<string, PeerInfo> = new Map();
  private connections: Map<string, any> = new Map(); // Mock connection objects
  private blacklistedPeers: Set<string> = new Set();
  
  // Message handling
  private messageHandlers: Map<MessageType, (message: NetworkMessage, peerId: string) => Promise<void>> = new Map();
  private messageQueue: Map<string, NetworkMessage[]> = new Map();
  
  // Network statistics
  private stats: NetworkStats = {
    connectedPeers: 0,
    totalMessages: 0,
    messagesSent: 0,
    messagesReceived: 0,
    bytesTransferred: BigInt(0),
    averageLatency: 0,
    networkUptime: 0
  };
  
  private isRunning = false;
  private startTime = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor(config: NetworkConfig) {
    super();
    
    this.logger = new Logger('P2PNetworkManager');
    this.config = config;
    
    this.setupMessageHandlers();
    
    this.logger.info('P2P Network Manager initialized', {
      listenAddress: config.listenAddress,
      listenPort: config.listenPort,
      maxPeers: config.maxPeers,
      protocolVersion: config.protocolVersion
    });
  }

  /**
   * Start the P2P network manager
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('P2P Network Manager already running');
    }
    
    this.startTime = Date.now();
    
    // Start listening for connections
    await this.startListening();
    
    // Connect to bootstrap peers
    if (this.config.bootstrapPeers.length > 0) {
      await this.connectToBootstrapPeers();
    }
    
    // Start peer discovery if enabled
    if (this.config.enableDiscovery) {
      await this.startPeerDiscovery();
    }
    
    // Start heartbeat
    this.startHeartbeat();
    
    this.isRunning = true;
    
    this.logger.info('P2P Network Manager started', {
      listening: `${this.config.listenAddress}:${this.config.listenPort}`,
      bootstrapPeers: this.config.bootstrapPeers.length,
      enableDiscovery: this.config.enableDiscovery
    });
    
    this.emit('network:started');
  }

  /**
   * Stop the P2P network manager
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    
    // Stop heartbeat
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    // Disconnect from all peers
    await this.disconnectAllPeers();
    
    // Clear data structures
    this.peers.clear();
    this.connections.clear();
    this.messageQueue.clear();
    
    this.logger.info('P2P Network Manager stopped');
    this.emit('network:stopped');
  }

  /**
   * Broadcast a message to all connected peers
   */
  async broadcast(message: NetworkMessage, excludePeer?: string): Promise<void> {
    if (!this.isRunning) {
      throw new Error('P2P Network Manager not running');
    }

    const connectedPeers = Array.from(this.peers.values())
      .filter(peer => peer.isConnected && peer.id !== excludePeer);
    
    if (connectedPeers.length === 0) {
      this.logger.warn('No connected peers to broadcast to');
      return;
    }

    const promises: Promise<void>[] = [];
    
    for (const peer of connectedPeers) {
      promises.push(this.sendMessage(peer.id, message));
    }

    await Promise.all(promises);
    
    this.logger.debug('Message broadcasted', {
      messageType: message.type,
      peersCount: connectedPeers.length
    });
  }

  /**
   * Send a message to a specific peer
   */
  async sendMessage(peerId: string, message: NetworkMessage): Promise<void> {
    if (!this.isRunning) {
      throw new Error('P2P Network Manager not running');
    }

    const peer = this.peers.get(peerId);
    if (!peer || !peer.isConnected) {
      throw new Error(`Peer not connected: ${peerId}`);
    }

    const connection = this.connections.get(peerId);
    if (!connection) {
      throw new Error(`No connection for peer: ${peerId}`);
    }

    // Check message size
    const messageSize = JSON.stringify(message).length;
    if (messageSize > this.config.maxMessageSize) {
      throw new Error(`Message size exceeds limit: ${messageSize} > ${this.config.maxMessageSize}`);
    }

    try {
      // Mock message sending - in real implementation would use actual network transport
      await this.mockSendMessage(connection, message);
      
      // Update statistics
      this.stats.messagesSent++;
      this.stats.totalMessages++;
      this.stats.bytesTransferred += BigInt(messageSize);
      
      this.logger.debug('Message sent', {
        peerId,
        messageType: message.type,
        size: messageSize
      });

    } catch (error) {
      this.logger.error('Failed to send message', {
        peerId,
        messageType: message.type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Consider disconnecting problematic peer
      await this.handlePeerError(peerId, error as Error);
      throw error;
    }
  }

  /**
   * Connect to a new peer
   */
  async connectToPeer(address: string, port: number): Promise<string> {
    if (!this.isRunning) {
      throw new Error('P2P Network Manager not running');
    }

    const peerAddress = `${address}:${port}`;
    
    // Check if already connected or blacklisted
    const existingPeer = Array.from(this.peers.values())
      .find(p => `${p.address}:${p.port}` === peerAddress);
    
    if (existingPeer?.isConnected) {
      return existingPeer.id;
    }
    
    if (this.blacklistedPeers.has(peerAddress)) {
      throw new Error(`Peer is blacklisted: ${peerAddress}`);
    }

    // Check peer limit
    const connectedCount = Array.from(this.peers.values()).filter(p => p.isConnected).length;
    if (connectedCount >= this.config.maxPeers) {
      throw new Error(`Max peers reached: ${this.config.maxPeers}`);
    }

    try {
      // Mock connection establishment
      const connection = await this.mockConnect(address, port);
      const peerId = this.generatePeerId();
      
      // Perform handshake
      const peerInfo = await this.performHandshake(connection, peerId, address, port);
      
      // Store peer and connection
      this.peers.set(peerId, peerInfo);
      this.connections.set(peerId, connection);
      
      // Update statistics
      this.stats.connectedPeers++;
      
      this.logger.info('Connected to peer', {
        peerId,
        address: peerAddress,
        protocolVersion: peerInfo.protocolVersion
      });
      
      this.emit('peer:connected', peerId);
      
      return peerId;

    } catch (error) {
      this.logger.error('Failed to connect to peer', {
        address: peerAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Disconnect from a peer
   */
  async disconnectPeer(peerId: string): Promise<void> {
    const peer = this.peers.get(peerId);
    const connection = this.connections.get(peerId);
    
    if (peer) {
      peer.isConnected = false;
      this.stats.connectedPeers = Math.max(0, this.stats.connectedPeers - 1);
    }
    
    if (connection) {
      await this.mockDisconnect(connection);
      this.connections.delete(peerId);
    }
    
    // Clean up message queue
    this.messageQueue.delete(peerId);
    
    this.logger.info('Disconnected from peer', { peerId });
    this.emit('peer:disconnected', peerId);
  }

  /**
   * Blacklist a peer
   */
  async blacklistPeer(peerId: string, reason: string): Promise<void> {
    const peer = this.peers.get(peerId);
    if (peer) {
      const peerAddress = `${peer.address}:${peer.port}`;
      this.blacklistedPeers.add(peerAddress);
      
      await this.disconnectPeer(peerId);
      
      this.logger.warn('Peer blacklisted', {
        peerId,
        address: peerAddress,
        reason
      });
      
      this.emit('peer:blacklisted', { peerId, reason });
    }
  }

  /**
   * Get network statistics
   */
  getNetworkStats(): NetworkStats {
    const now = Date.now();
    const uptime = this.isRunning ? now - this.startTime : 0;
    
    return {
      ...this.stats,
      networkUptime: uptime,
      connectedPeers: Array.from(this.peers.values()).filter(p => p.isConnected).length
    };
  }

  /**
   * Get connected peers information
   */
  getConnectedPeers(): PeerInfo[] {
    return Array.from(this.peers.values()).filter(peer => peer.isConnected);
  }

  /**
   * Get peer information
   */
  getPeerInfo(peerId: string): PeerInfo | undefined {
    return this.peers.get(peerId);
  }

  /**
   * Register message handler for a specific message type
   */
  registerMessageHandler(
    messageType: MessageType, 
    handler: (message: NetworkMessage, peerId: string) => Promise<void>
  ): void {
    this.messageHandlers.set(messageType, handler);
    this.logger.debug('Message handler registered', { messageType });
  }

  /**
   * Unregister message handler
   */
  unregisterMessageHandler(messageType: MessageType): void {
    this.messageHandlers.delete(messageType);
    this.logger.debug('Message handler unregistered', { messageType });
  }

  /**
   * Private helper methods
   */

  private setupMessageHandlers(): void {
    // Register default message handlers
    this.messageHandlers.set('peer_discovery', this.handlePeerDiscovery.bind(this));
    this.messageHandlers.set('sync_request', this.handleSyncRequest.bind(this));
    this.messageHandlers.set('sync_response', this.handleSyncResponse.bind(this));
  }

  private async startListening(): Promise<void> {
    // Mock server start
    this.logger.info('Started listening for connections', {
      address: this.config.listenAddress,
      port: this.config.listenPort
    });
  }

  private async connectToBootstrapPeers(): Promise<void> {
    const connectionPromises: Promise<void>[] = [];
    
    for (const bootstrapPeer of this.config.bootstrapPeers) {
      const [address, portStr] = bootstrapPeer.split(':');
      const port = parseInt(portStr, 10);
      
      connectionPromises.push(
        this.connectToPeer(address, port)
          .then(() => {
            this.logger.info('Connected to bootstrap peer', { peer: bootstrapPeer });
          })
          .catch(error => {
            this.logger.warn('Failed to connect to bootstrap peer', {
              peer: bootstrapPeer,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          })
      );
    }
    
    await Promise.allSettled(connectionPromises);
  }

  private async startPeerDiscovery(): Promise<void> {
    // Mock peer discovery
    this.logger.info('Peer discovery enabled');
    
    // Periodically discover new peers
    setInterval(async () => {
      if (!this.isRunning) return;
      
      await this.discoverPeers();
    }, 30000); // Every 30 seconds
  }

  private async discoverPeers(): Promise<void> {
    // Request peer lists from connected peers
    const discoveryMessage: NetworkMessage = {
      type: 'peer_discovery',
      from: 'self',
      data: { request: 'peer_list' },
      timestamp: Date.now(),
      signature: 'mock_signature'
    };
    
    await this.broadcast(discoveryMessage);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(async () => {
      if (!this.isRunning) return;
      
      await this.sendHeartbeats();
      await this.checkPeerHealth();
    }, this.config.heartbeatInterval);
  }

  private async sendHeartbeats(): Promise<void> {
    const heartbeatMessage: NetworkMessage = {
      type: 'peer_discovery',
      from: 'self',
      data: { 
        type: 'heartbeat',
        timestamp: Date.now(),
        blockHeight: 0 // Would get current block height
      },
      timestamp: Date.now(),
      signature: 'mock_signature'
    };
    
    await this.broadcast(heartbeatMessage);
  }

  private async checkPeerHealth(): Promise<void> {
    const now = Date.now();
    const timeout = this.config.connectionTimeout;
    
    for (const [peerId, peer] of this.peers.entries()) {
      if (!peer.isConnected) continue;
      
      if (now - peer.lastSeen > timeout) {
        this.logger.warn('Peer timeout detected', {
          peerId,
          lastSeen: peer.lastSeen,
          timeout
        });
        
        await this.disconnectPeer(peerId);
      }
    }
  }

  private async disconnectAllPeers(): Promise<void> {
    const disconnectPromises: Promise<void>[] = [];
    
    for (const peerId of this.peers.keys()) {
      disconnectPromises.push(this.disconnectPeer(peerId));
    }
    
    await Promise.all(disconnectPromises);
  }

  private async handleIncomingMessage(message: NetworkMessage, peerId: string): Promise<void> {
    this.stats.messagesReceived++;
    this.stats.totalMessages++;
    this.stats.bytesTransferred += BigInt(JSON.stringify(message).length);
    
    // Update peer last seen
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.lastSeen = Date.now();
    }
    
    // Find and execute handler
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      try {
        await handler(message, peerId);
      } catch (error) {
        this.logger.error('Message handler error', {
          messageType: message.type,
          peerId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else {
      this.logger.warn('No handler for message type', {
        messageType: message.type,
        peerId
      });
    }
  }

  private async handlePeerError(peerId: string, error: Error): Promise<void> {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.reputation = Math.max(0, peer.reputation - 10);
      
      if (peer.reputation <= 0) {
        await this.blacklistPeer(peerId, `Low reputation: ${error.message}`);
      }
    }
  }

  // Mock message handlers
  
  private async handlePeerDiscovery(message: NetworkMessage, peerId: string): Promise<void> {
    if (message.data.request === 'peer_list') {
      // Send back our known peers
      const knownPeers = this.getConnectedPeers()
        .filter(p => p.id !== peerId)
        .map(p => ({ address: p.address, port: p.port }));
      
      const response: NetworkMessage = {
        type: 'peer_discovery',
        from: 'self',
        to: peerId,
        data: { peers: knownPeers },
        timestamp: Date.now(),
        signature: 'mock_signature'
      };
      
      await this.sendMessage(peerId, response);
    } else if (message.data.peers) {
      // Process discovered peers
      for (const peerData of message.data.peers) {
        if (this.peers.size < this.config.maxPeers) {
          try {
            await this.connectToPeer(peerData.address, peerData.port);
          } catch (error) {
            // Ignore connection errors during discovery
          }
        }
      }
    }
  }

  private async handleSyncRequest(message: NetworkMessage, peerId: string): Promise<void> {
    // Mock sync request handling
    this.logger.debug('Sync request received', { peerId });
  }

  private async handleSyncResponse(message: NetworkMessage, peerId: string): Promise<void> {
    // Mock sync response handling
    this.logger.debug('Sync response received', { peerId });
  }

  // Mock network operations
  
  private async mockConnect(address: string, port: number): Promise<any> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      address,
      port,
      connected: true,
      socket: `mock_socket_${address}:${port}`
    };
  }

  private async mockDisconnect(connection: any): Promise<void> {
    connection.connected = false;
  }

  private async mockSendMessage(connection: any, message: NetworkMessage): Promise<void> {
    if (!connection.connected) {
      throw new Error('Connection not available');
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  private async performHandshake(
    connection: any, 
    peerId: string, 
    address: string, 
    port: number
  ): Promise<PeerInfo> {
    // Mock handshake
    return {
      id: peerId,
      address,
      port,
      protocolVersion: this.config.protocolVersion,
      isConnected: true,
      lastSeen: Date.now(),
      latency: 100,
      reputation: 100,
      capabilities: ['consensus', 'tx_relay', 'block_relay']
    };
  }

  private generatePeerId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `peer_${timestamp}_${random}`;
  }
}

export default P2PNetworkManager;