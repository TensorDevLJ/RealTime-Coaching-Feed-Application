import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB || 'feed_db',
};

export class Database {
  constructor() {
    this.client = new Client(dbConfig);
    this.isConnected = false;
  }

  async connect() {
    try {
      await this.client.connect();
      this.isConnected = true;
      console.log('✓ PostgreSQL Connected');
      await this.initializeTables();
    } catch (error) {
      console.error('✗ PostgreSQL Connection Error:', error.message);
      process.exit(1);
    }
  }

  async initializeTables() {
    try {
      // Create feeds table if not exists
      await this.client.query(`
        CREATE TABLE IF NOT EXISTS feeds (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          url VARCHAR(255) UNIQUE NOT NULL,
          source VARCHAR(100),
          category VARCHAR(50),
          image_url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT true
        );
      `);

      // Create index for better query performance
      await this.client.query(`
        CREATE INDEX IF NOT EXISTS idx_feeds_created_at 
        ON feeds(created_at DESC);
      `);

      await this.client.query(`
        CREATE INDEX IF NOT EXISTS idx_feeds_is_active 
        ON feeds(is_active);
      `);

      console.log('✓ Database tables initialized');
    } catch (error) {
      console.error('✗ Table initialization error:', error.message);
    }
  }

  async query(text, params) {
    try {
      const result = await this.client.query(text, params);
      return result;
    } catch (error) {
      console.error('✗ Query error:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.client.end();
      this.isConnected = false;
      console.log('✓ PostgreSQL Disconnected');
    } catch (error) {
      console.error('✗ Disconnect error:', error.message);
    }
  }
}

export default Database;
