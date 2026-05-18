import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import Database from './database.js';
import RedisCache from './redis.js';
import WebSocketManager from './websocket.js';
import createFeedRoutes from './routes/feeds.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Initialize services
let db, cache, wsManager;

/**
 * Initialize all services
 */
async function initializeServices() {
  try {
    // Initialize Database
    db = new Database();
    await db.connect();

    // Initialize Redis Cache
    cache = new RedisCache();
    await cache.connect();

    // Initialize WebSocket Manager
    wsManager = new WebSocketManager(httpServer);
    console.log('✓ WebSocket Server Initialized');

    // Setup routes
    const feedRoutes = createFeedRoutes(db, cache, wsManager.getIO());
    app.use('/api/feed', feedRoutes);

    console.log('\n✓ All services initialized successfully\n');
  } catch (error) {
    console.error('✗ Initialization failed:', error.message);
    process.exit(1);
  }
}

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: db?.isConnected ? 'connected' : 'disconnected',
      redis: cache?.isConnected ? 'connected' : 'disconnected',
      websocket: wsManager ? 'active' : 'inactive',
      connectedClients: wsManager?.getConnectedClientsInfo().totalClients || 0,
    },
  });
});

/**
 * Admin endpoint to check connected clients
 */
app.get('/api/admin/clients', (req, res) => {
  if (!wsManager) {
    return res.status(503).json({ error: 'WebSocket service not available' });
  }

  const clientsInfo = wsManager.getConnectedClientsInfo();
  res.status(200).json({
    success: true,
    data: clientsInfo,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Cache stats endpoint
 */
app.get('/api/admin/cache-stats', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      cacheConnected: cache?.isConnected || false,
      cacheType: 'Redis',
      ttl: 300,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('\n🛑 Shutting down gracefully...');

  if (wsManager?.getIO()) {
    wsManager.getIO().close();
    console.log('✓ WebSocket server closed');
  }

  if (db?.isConnected) {
    await db.disconnect();
  }

  if (cache?.isConnected) {
    await cache.disconnect();
  }

  httpServer.close(() => {
    console.log('✓ HTTP server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.log('⚠️ Forced shutdown');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/**
 * Start server
 */
async function startServer() {
  await initializeServices();

  httpServer.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket: ws://localhost:${PORT}`);
    console.log(`\n📚 API Endpoints:`);
    console.log(`   GET    /api/feed       - Get all feeds (cached)`);
    console.log(`   POST   /api/feed       - Create new feed`);
    console.log(`   DELETE /api/feed/:id   - Delete feed`);
    console.log(`\n📊 Admin Endpoints:`);
    console.log(`   GET    /api/health     - Health check`);
    console.log(`   GET    /api/admin/clients      - Connected clients`);
    console.log(`   GET    /api/admin/cache-stats  - Cache statistics`);
    console.log('\n');
  });
}

startServer().catch((error) => {
  console.error('✗ Failed to start server:', error.message);
  process.exit(1);
});
