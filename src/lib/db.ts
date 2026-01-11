import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local for standalone scripts (Next.js loads it automatically)
if (!process.env.DATABASE_URL) {
    try {
        const envPath = join(process.cwd(), '.env.local');
        const envContent = readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && !key.startsWith('#')) {
                process.env[key.trim()] = valueParts.join('=').replace(/^["']|["']$/g, '').trim();
            }
        });
    } catch (e) { }
}

// Create a connection pool for Neon DB
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
});

// Helper function to query the database
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result.rows;
    } finally {
        client.release();
    }
}

// Helper for single row queries
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const rows = await query<T>(text, params);
    return rows[0] || null;
}

// Export pool for direct access if needed
export { pool };
