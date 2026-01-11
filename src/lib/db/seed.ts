import { readFileSync } from 'fs';
import { join } from 'path';

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

import { pool } from '../db';

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  const client = await pool.connect();

  try {
    // Clear existing data
    await client.query('DELETE FROM notes');
    await client.query('DELETE FROM activities');
    await client.query('DELETE FROM deals');
    await client.query('DELETE FROM contacts');
    await client.query('DELETE FROM companies');

    // Insert companies
    const companiesResult = await client.query(`
      INSERT INTO companies (name, industry, website, size, address) VALUES
      ('Acme Corporation', 'Technology', 'https://acme.example.com', 'LARGE', '123 Tech Street, San Francisco, CA'),
      ('Globex Inc', 'Manufacturing', 'https://globex.example.com', 'ENTERPRISE', '456 Industry Ave, New York, NY'),
      ('Startup XYZ', 'SaaS', 'https://startupxyz.io', 'STARTUP', '789 Innovation Blvd, Austin, TX')
      RETURNING id, name;
    `);

    const companies = companiesResult.rows;
    console.log(`   ✓ ${companies.length} companies created`);

    // Insert contacts
    const contactsResult = await client.query(`
      INSERT INTO contacts (first_name, last_name, email, phone, job_title, status, company_id) VALUES
      ('John', 'Doe', 'john.doe@acme.example.com', '+1-555-0101', 'CTO', 'CUSTOMER', $1),
      ('Jane', 'Smith', 'jane.smith@globex.example.com', '+1-555-0102', 'VP of Sales', 'PROSPECT', $2),
      ('Bob', 'Johnson', 'bob@startupxyz.io', '+1-555-0103', 'CEO', 'LEAD', $3),
      ('Alice', 'Williams', 'alice.williams@example.com', '+1-555-0104', 'Product Manager', 'LEAD', NULL)
      RETURNING id, first_name, last_name;
    `, [companies[0].id, companies[1].id, companies[2].id]);

    const contacts = contactsResult.rows;
    console.log(`   ✓ ${contacts.length} contacts created`);

    // Insert deals
    const dealsResult = await client.query(`
      INSERT INTO deals (title, value, currency, stage, probability, close_date, contact_id, company_id) VALUES
      ('Enterprise License Deal', 150000, 'USD', 'NEGOTIATION', 70, '2024-03-31', $1, $4),
      ('Globex Expansion Project', 75000, 'USD', 'PROPOSAL', 50, '2024-04-15', $2, $5),
      ('Startup Pilot Program', 25000, 'USD', 'DISCOVERY', 30, '2024-05-01', $3, $6),
      ('New Lead Opportunity', 10000, 'USD', 'QUALIFICATION', 10, NULL, $7, NULL)
      RETURNING id, title;
    `, [contacts[0].id, contacts[1].id, contacts[2].id, companies[0].id, companies[1].id, companies[2].id, contacts[3].id]);

    const deals = dealsResult.rows;
    console.log(`   ✓ ${deals.length} deals created`);

    // Insert activities
    await client.query(`
      INSERT INTO activities (type, subject, description, due_date, contact_id, deal_id) VALUES
      ('MEETING', 'Contract Review Meeting', 'Review final contract terms with legal team', '2024-02-15', $1, $5),
      ('CALL', 'Follow-up Call', 'Discuss proposal feedback', '2024-02-10', $2, $6),
      ('EMAIL', 'Send Product Demo', 'Share demo video and documentation', '2024-02-08', $3, $7),
      ('TASK', 'Prepare Qualification Questionnaire', NULL, '2024-02-05', $4, $8);
    `, [contacts[0].id, contacts[1].id, contacts[2].id, contacts[3].id, deals[0].id, deals[1].id, deals[2].id, deals[3].id]);
    console.log(`   ✓ 4 activities created`);

    // Insert notes
    await client.query(`
      INSERT INTO notes (content, contact_id, deal_id) VALUES
      ('John is very interested in our enterprise features. Key decision maker.', $1, NULL),
      ('Discussed pricing structure. They need approval from board.', NULL, $3),
      ('Jane mentioned they are evaluating 3 vendors. Timeline is Q2.', $2, $4);
    `, [contacts[0].id, contacts[1].id, deals[0].id, deals[1].id]);
    console.log(`   ✓ 3 notes created`);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
