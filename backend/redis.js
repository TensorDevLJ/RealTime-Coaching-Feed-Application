import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export class RedisCache {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      });

      this.client.on('error', (err) => {
        console.error('✗ Redis Client Error:', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✓ Redis Connected');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error('✗ Redis Connection Error:', error.message);
      console.log('⚠ Running without Redis cache');
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) return null;
    try {
      const value = await this.client.get(key);
      if (value) {
        console.log(`✓ Cache HIT: ${key}`);
        return JSON.parse(value);
      }
      console.log(`✗ Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error(`✗ Cache GET error (${key}):`, error.message);
      return null;
    }
  }

  async set(key, value, expirySeconds = 3600) {
    if (!this.isConnected || !this.client) return false;
    try {
      await this.client.setEx(key, expirySeconds, JSON.stringify(value));
      console.log(`✓ Cache SET: ${key} (TTL: ${expirySeconds}s)`);
      return true;
    } catch (error) {
      console.error(`✗ Cache SET error (${key}):`, error.message);
      return false;
    }
  }

  async delete(key) {
    if (!this.isConnected || !this.client) return false;
    try {
      const result = await this.client.del(key);
      console.log(`✓ Cache DELETE: ${key}`);
      return result > 0;
    } catch (error) {
      console.error(`✗ Cache DELETE error (${key}):`, error.message);
      return false;
    }
  }

  async invalidateAll() {
    if (!this.isConnected || !this.client) return false;
    try {
      const keys = await this.client.keys('feeds:*');
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`✓ Cache INVALIDATED: ${keys.length} keys deleted`);
      }
      return true;
    } catch (error) {
      console.error('✗ Cache invalidation error:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        this.isConnected = false;
        console.log('✓ Redis Disconnected');
      } catch (error) {
        console.error('✗ Redis disconnect error:', error.message);
      }
    }
  }
}

export default RedisCache;
