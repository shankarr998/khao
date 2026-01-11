import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../db';

// Load .env.local for standalone execution
const envPath = join(process.cwd(), '.env.local');
try {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && !key.startsWith('#')) {
            process.env[key.trim()] = valueParts.join('=').replace(/^["']|["']$/g, '').trim();
        }
    });
} catch (e) { }

async function initUsersTable() {
    console.log('🚀 Initializing users table...');

    const client = await pool.connect();

    try {
        // Create user_role ENUM type
        await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'user', 'viewer');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

        // Create users table
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role user_role DEFAULT 'user',
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

        // Create index on email for faster lookups
        await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);

        console.log('✅ Users table initialized successfully!');
    } catch (error) {
        console.error('❌ Error initializing users table:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

initUsersTable();
