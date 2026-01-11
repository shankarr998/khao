import { readFileSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';
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

const SAMPLE_USERS = [
    {
        email: 'admin@crm.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        avatarUrl: null,
    },
    {
        email: 'sarah@crm.com',
        password: 'sarah123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'user',
        avatarUrl: null,
    },
    {
        email: 'mike@crm.com',
        password: 'mike123',
        firstName: 'Mike',
        lastName: 'Chen',
        role: 'user',
        avatarUrl: null,
    },
    {
        email: 'viewer@crm.com',
        password: 'viewer123',
        firstName: 'View',
        lastName: 'Only',
        role: 'viewer',
        avatarUrl: null,
    },
];

async function seedUsers() {
    console.log('🌱 Seeding users...');

    const client = await pool.connect();

    try {
        for (const user of SAMPLE_USERS) {
            // Hash the password
            const passwordHash = await bcrypt.hash(user.password, 10);

            // Insert user (ignore if already exists)
            await client.query(
                `INSERT INTO users (email, password_hash, first_name, last_name, role, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO NOTHING`,
                [user.email, passwordHash, user.firstName, user.lastName, user.role, user.avatarUrl]
            );
        }

        console.log(`   ✓ ${SAMPLE_USERS.length} users created`);
        console.log('');
        console.log('📋 Sample login credentials:');
        console.log('   Admin: admin@crm.com / admin123');
        console.log('   User:  sarah@crm.com / sarah123');
        console.log('   User:  mike@crm.com / mike123');
        console.log('   Viewer: viewer@crm.com / viewer123');
        console.log('');
        console.log('✅ Users seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

seedUsers();
