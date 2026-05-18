import { Server as SocketIOServer } from 'socket.io';

export class WebSocketManager {
  constructor(server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.connectedClients = new Map();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const clientId = socket.id;
      const timestamp = new Date().toISOString();

      console.log(`\n🟢 Client Connected: ${clientId}`);
      console.log(`📊 Total Clients: ${this.io.engine.clientsCount}`);

      // Track connected client
      this.connectedClients.set(clientId, {
        id: clientId,
        connectedAt: timestamp,
        lastActivity: timestamp,
        eventCount: 0,
      });

      /**
       * Handle client subscription to feed updates
       * Prevents duplicate event emissions
       */
      socket.on('subscribe:feeds', (data) => {
        console.log(`📡 ${clientId} subscribed to feeds`);

        // Add to feeds room
        socket.join('feeds');

        socket.emit('subscription:confirmed', {
          type: 'subscription_confirmed',
          room: 'feeds',
          timestamp,
          clientId,
        });
      });

      /**
       * Handle client unsubscription
       */
      socket.on('unsubscribe:feeds', () => {
        console.log(`📴 ${clientId} unsubscribed from feeds`);
        socket.leave('feeds');
      });

      /**
       * Handle keep-alive ping to maintain connection
       */
      socket.on('ping', () => {
        const client = this.connectedClients.get(clientId);
        if (client) {
          client.lastActivity = new Date().toISOString();
          client.eventCount++;
        }
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });

      /**
       * Handle client reconnection
       */
      socket.on('reconnect', () => {
        console.log(`🔄 Client Reconnected: ${clientId}`);
        const client = this.connectedClients.get(clientId);
        if (client) {
          client.lastActivity = new Date().toISOString();
        }
      });

      /**
       * Handle client disconnect
       */
      socket.on('disconnect', (reason) => {
        console.log(`🔴 Client Disconnected: ${clientId}`);
        console.log(`📝 Disconnect Reason: ${reason}`);
        console.log(`📊 Total Clients: ${this.io.engine.clientsCount}`);

        this.connectedClients.delete(clientId);

        // Broadcast updated client count
        this.io.emit('clients:updated', {
          type: 'clients_updated',
          count: this.io.engine.clientsCount,
          timestamp: new Date().toISOString(),
        });
      });

      // Broadcast updated client count
      this.io.emit('clients:updated', {
        type: 'clients_updated',
        count: this.io.engine.clientsCount,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Broadcast new feed to all connected clients
   * Used by POST /feed endpoint
   */
  broadcastFeedCreated(feed) {
    console.log(`\n📡 Broadcasting feed:created to ${this.io.engine.clientsCount} clients`);
    this.io.to('feeds').emit('feed:created', {
      type: 'feed_created',
      feed,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast feed deletion to all connected clients
   */
  broadcastFeedDeleted(feedId) {
    console.log(`📡 Broadcasting feed:deleted for ${feedId}`);
    this.io.to('feeds').emit('feed:deleted', {
      type: 'feed_deleted',
      feedId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get connected clients info
   */
  getConnectedClientsInfo() {
    return {
      totalClients: this.io.engine.clientsCount,
      clients: Array.from(this.connectedClients.values()),
    };
  }

  /**
   * Get Socket.IO instance
   */
  getIO() {
    return this.io;
  }
}

export default WebSocketManager;
