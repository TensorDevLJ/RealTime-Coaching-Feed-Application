import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Database from '../database.js';
import RedisCache from '../redis.js';

export function createFeedRoutes(db, cache, io) {
  const router = express.Router();

  const CACHE_KEY = 'feeds:all';
  const CACHE_TTL = 300; // 5 minutes

  /**
   * GET /feed
   * Retrieve all active feeds with Redis caching
   * Returns cached data if available, otherwise queries database
   */
  router.get('/', async (req, res) => {
    try {
      console.log('📥 GET /feed - Incoming request');

      // Try to get from cache first
      let feeds = await cache.get(CACHE_KEY);

      if (feeds) {
        console.log('📦 Serving from cache');
        return res.status(200).json({
          success: true,
          data: feeds,
          source: 'cache',
          timestamp: new Date().toISOString(),
        });
      }

      // Cache miss - query database
      console.log('🔍 Cache miss - querying database');
      const result = await db.query(
        'SELECT * FROM feeds WHERE is_active = true ORDER BY created_at DESC LIMIT 100',
        []
      );

      feeds = result.rows;

      // Cache the results
      await cache.set(CACHE_KEY, feeds, CACHE_TTL);

      return res.status(200).json({
        success: true,
        data: feeds,
        source: 'database',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ GET /feed error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch feeds',
        message: error.message,
      });
    }
  });

  /**
   * POST /feed
   * Create a new feed with validation and real-time broadcast
   * Validates required fields and unique URL
   * Broadcasts to all connected WebSocket clients
   */
  router.post('/', async (req, res) => {
    try {
      console.log('📥 POST /feed - Incoming request:', req.body);

      const { title, description, url, source, category, image_url } = req.body;

      // Validation
      if (!title || !url) {
        console.log('⚠️ Validation failed - Missing required fields');
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          required: ['title', 'url'],
        });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        console.log('⚠️ Validation failed - Invalid URL format');
        return res.status(400).json({
          success: false,
          error: 'Invalid URL format',
        });
      }

      const feedId = uuidv4();
      const now = new Date();

      // Insert into database
      console.log('💾 Inserting feed into database');
      const result = await db.query(
        `INSERT INTO feeds (id, title, description, url, source, category, image_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [feedId, title, description || null, url, source || null, category || null, image_url || null, now, now]
      );

      const newFeed = result.rows[0];
      console.log('✓ Feed created:', newFeed.id);

      // Invalidate cache
      console.log('🔄 Invalidating cache');
      await cache.delete(CACHE_KEY);

      // Broadcast to all connected clients via WebSocket
      if (io) {
        console.log('📡 Broadcasting new feed to all clients');
        io.emit('feed:created', {
          type: 'feed_created',
          feed: newFeed,
          timestamp: now.toISOString(),
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Feed created successfully',
        data: newFeed,
        timestamp: now.toISOString(),
      });
    } catch (error) {
      // Check if it's a unique constraint violation (duplicate URL)
      if (error.code === '23505') {
        console.log('⚠️ Duplicate URL error');
        return res.status(409).json({
          success: false,
          error: 'Feed with this URL already exists',
        });
      }

      console.error('❌ POST /feed error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to create feed',
        message: error.message,
      });
    }
  });

  /**
   * DELETE /feed/:id
   * Soft delete a feed (mark as inactive)
   */
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log('📥 DELETE /feed/:id -', id);

      const result = await db.query(
        'UPDATE feeds SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Feed not found',
        });
      }

      // Invalidate cache and broadcast
      await cache.delete(CACHE_KEY);
      if (io) {
        io.emit('feed:deleted', {
          type: 'feed_deleted',
          feedId: id,
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Feed deleted successfully',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('❌ DELETE /feed/:id error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete feed',
        message: error.message,
      });
    }
  });

  return router;
}

export default createFeedRoutes;
