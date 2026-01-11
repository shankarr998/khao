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


async function initDatabase() {
  console.log('🚀 Initializing database schema...');

  const client = await pool.connect();

  try {
    // Create ENUM types
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE contact_status AS ENUM ('LEAD', 'PROSPECT', 'CUSTOMER', 'CHURNED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE company_size AS ENUM ('STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE deal_stage AS ENUM ('QUALIFICATION', 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE activity_type AS ENUM ('TASK', 'CALL', 'MEETING', 'EMAIL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create companies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(100),
        website VARCHAR(255),
        size company_size,
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create contacts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        job_title VARCHAR(100),
        status contact_status DEFAULT 'LEAD',
        company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create deals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS deals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        value DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        stage deal_stage DEFAULT 'QUALIFICATION',
        probability INTEGER DEFAULT 10,
        close_date DATE,
        contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
        company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create activities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type activity_type NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
        deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create notes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
        deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_activities_completed ON activities(completed);`);

    console.log('✅ Database schema initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
