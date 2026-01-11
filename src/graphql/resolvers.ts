import { query, queryOne } from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie, clearAuthCookie, verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Helper to convert snake_case to camelCase
function toCamelCase(row: any): any {
    if (!row) return null;
    const result: any = {};
    for (const key in row) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = row[key];
    }
    return result;
}

function toCamelCaseArray(rows: any[]): any[] {
    return rows.map(toCamelCase);
}

export const resolvers = {
    Query: {
        // Auth - Get current logged in user
        me: async () => {
            try {
                const cookieStore = await cookies();
                const token = cookieStore.get('auth-token')?.value;
                if (!token) return null;

                const payload = verifyToken(token);
                if (!payload) return null;

                const row = await queryOne(
                    'SELECT id, email, first_name, last_name, role, avatar_url, created_at FROM users WHERE id = $1',
                    [payload.userId]
                );
                return toCamelCase(row);
            } catch {
                return null;
            }
        },

        // Dashboard
        dashboardStats: async () => {
            const [
                contacts,
                companies,
                deals,
                dealValue,
                openDeals,
                wonDeals,
                lostDeals,
                upcoming,
                overdue,
            ] = await Promise.all([
                queryOne<{ count: string }>('SELECT COUNT(*) as count FROM contacts'),
                queryOne<{ count: string }>('SELECT COUNT(*) as count FROM companies'),
                queryOne<{ count: string }>('SELECT COUNT(*) as count FROM deals'),
                queryOne<{ sum: string }>('SELECT COALESCE(SUM(value), 0) as sum FROM deals'),
                queryOne<{ count: string }>("SELECT COUNT(*) as count FROM deals WHERE stage NOT IN ('CLOSED_WON', 'CLOSED_LOST')"),
                queryOne<{ count: string }>("SELECT COUNT(*) as count FROM deals WHERE stage = 'CLOSED_WON'"),
                queryOne<{ count: string }>("SELECT COUNT(*) as count FROM deals WHERE stage = 'CLOSED_LOST'"),
                queryOne<{ count: string }>('SELECT COUNT(*) as count FROM activities WHERE completed = false AND due_date >= NOW()'),
                queryOne<{ count: string }>('SELECT COUNT(*) as count FROM activities WHERE completed = false AND due_date < NOW()'),
            ]);

            return {
                totalContacts: parseInt(contacts?.count || '0'),
                totalCompanies: parseInt(companies?.count || '0'),
                totalDeals: parseInt(deals?.count || '0'),
                totalDealValue: parseFloat(dealValue?.sum || '0'),
                openDeals: parseInt(openDeals?.count || '0'),
                wonDeals: parseInt(wonDeals?.count || '0'),
                lostDeals: parseInt(lostDeals?.count || '0'),
                upcomingActivities: parseInt(upcoming?.count || '0'),
                overdueActivities: parseInt(overdue?.count || '0'),
            };
        },

        dealsByStage: async () => {
            const stages = ['QUALIFICATION', 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
            const results = await Promise.all(
                stages.map(async (stage) => {
                    const result = await queryOne<{ count: string; sum: string }>(
                        'SELECT COUNT(*) as count, COALESCE(SUM(value), 0) as sum FROM deals WHERE stage = $1',
                        [stage]
                    );
                    return {
                        stage,
                        count: parseInt(result?.count || '0'),
                        value: parseFloat(result?.sum || '0'),
                    };
                })
            );
            return results;
        },

        // Contacts
        contacts: async () => {
            const rows = await query('SELECT * FROM contacts ORDER BY created_at DESC');
            return toCamelCaseArray(rows);
        },
        contact: async (_: any, { id }: { id: string }) => {
            const row = await queryOne('SELECT * FROM contacts WHERE id = $1', [id]);
            return toCamelCase(row);
        },

        // Companies
        companies: async () => {
            const rows = await query('SELECT * FROM companies ORDER BY created_at DESC');
            return toCamelCaseArray(rows);
        },
        company: async (_: any, { id }: { id: string }) => {
            const row = await queryOne('SELECT * FROM companies WHERE id = $1', [id]);
            return toCamelCase(row);
        },

        // Deals
        deals: async () => {
            const rows = await query('SELECT * FROM deals ORDER BY created_at DESC');
            return toCamelCaseArray(rows);
        },
        deal: async (_: any, { id }: { id: string }) => {
            const row = await queryOne('SELECT * FROM deals WHERE id = $1', [id]);
            return toCamelCase(row);
        },

        // Activities
        activities: async () => {
            const rows = await query('SELECT * FROM activities ORDER BY due_date ASC');
            return toCamelCaseArray(rows);
        },
        activity: async (_: any, { id }: { id: string }) => {
            const row = await queryOne('SELECT * FROM activities WHERE id = $1', [id]);
            return toCamelCase(row);
        },

        // Notes
        notes: async () => {
            const rows = await query('SELECT * FROM notes ORDER BY created_at DESC');
            return toCamelCaseArray(rows);
        },
    },

    Mutation: {
        // Auth
        login: async (_: any, { email, password }: { email: string; password: string }) => {
            // Find user by email
            const user = await queryOne<any>(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Verify password
            const isValid = await verifyPassword(password, user.password_hash);
            if (!isValid) {
                throw new Error('Invalid email or password');
            }

            // Create token
            const token = createToken({
                id: user.id,
                email: user.email,
                role: user.role,
            });

            // Set auth cookie
            await setAuthCookie(token);

            return {
                user: toCamelCase({
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                    avatar_url: user.avatar_url,
                    created_at: user.created_at,
                }),
                token,
            };
        },

        logout: async () => {
            await clearAuthCookie();
            return true;
        },

        // Contacts
        createContact: async (_: any, { input }: { input: any }) => {
            const row = await queryOne(
                `INSERT INTO contacts (first_name, last_name, email, phone, job_title, status, company_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [input.firstName, input.lastName, input.email, input.phone, input.jobTitle, input.status || 'LEAD', input.companyId]
            );
            return toCamelCase(row);
        },
        updateContact: async (_: any, { id, input }: { id: string; input: any }) => {
            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (input.firstName !== undefined) { updates.push(`first_name = $${paramIndex++}`); values.push(input.firstName); }
            if (input.lastName !== undefined) { updates.push(`last_name = $${paramIndex++}`); values.push(input.lastName); }
            if (input.email !== undefined) { updates.push(`email = $${paramIndex++}`); values.push(input.email); }
            if (input.phone !== undefined) { updates.push(`phone = $${paramIndex++}`); values.push(input.phone); }
            if (input.jobTitle !== undefined) { updates.push(`job_title = $${paramIndex++}`); values.push(input.jobTitle); }
            if (input.status !== undefined) { updates.push(`status = $${paramIndex++}`); values.push(input.status); }
            if (input.companyId !== undefined) { updates.push(`company_id = $${paramIndex++}`); values.push(input.companyId || null); }
            updates.push(`updated_at = NOW()`);

            values.push(id);
            const row = await queryOne(
                `UPDATE contacts SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
                values
            );
            return toCamelCase(row);
        },
        deleteContact: async (_: any, { id }: { id: string }) => {
            await query('DELETE FROM contacts WHERE id = $1', [id]);
            return true;
        },

        // Companies
        createCompany: async (_: any, { input }: { input: any }) => {
            const row = await queryOne(
                `INSERT INTO companies (name, industry, website, size, address)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [input.name, input.industry, input.website, input.size, input.address]
            );
            return toCamelCase(row);
        },
        updateCompany: async (_: any, { id, input }: { id: string; input: any }) => {
            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (input.name !== undefined) { updates.push(`name = $${paramIndex++}`); values.push(input.name); }
            if (input.industry !== undefined) { updates.push(`industry = $${paramIndex++}`); values.push(input.industry); }
            if (input.website !== undefined) { updates.push(`website = $${paramIndex++}`); values.push(input.website); }
            if (input.size !== undefined) { updates.push(`size = $${paramIndex++}`); values.push(input.size); }
            if (input.address !== undefined) { updates.push(`address = $${paramIndex++}`); values.push(input.address); }
            updates.push(`updated_at = NOW()`);

            values.push(id);
            const row = await queryOne(
                `UPDATE companies SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
                values
            );
            return toCamelCase(row);
        },
        deleteCompany: async (_: any, { id }: { id: string }) => {
            await query('DELETE FROM companies WHERE id = $1', [id]);
            return true;
        },

        // Deals
        createDeal: async (_: any, { input }: { input: any }) => {
            const row = await queryOne(
                `INSERT INTO deals (title, value, currency, stage, probability, close_date, contact_id, company_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [input.title, input.value, input.currency || 'USD', input.stage || 'QUALIFICATION', input.probability || 10, input.closeDate, input.contactId, input.companyId]
            );
            return toCamelCase(row);
        },
        updateDeal: async (_: any, { id, input }: { id: string; input: any }) => {
            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (input.title !== undefined) { updates.push(`title = $${paramIndex++}`); values.push(input.title); }
            if (input.value !== undefined) { updates.push(`value = $${paramIndex++}`); values.push(input.value); }
            if (input.currency !== undefined) { updates.push(`currency = $${paramIndex++}`); values.push(input.currency); }
            if (input.stage !== undefined) { updates.push(`stage = $${paramIndex++}`); values.push(input.stage); }
            if (input.probability !== undefined) { updates.push(`probability = $${paramIndex++}`); values.push(input.probability); }
            if (input.closeDate !== undefined) { updates.push(`close_date = $${paramIndex++}`); values.push(input.closeDate); }
            if (input.contactId !== undefined) { updates.push(`contact_id = $${paramIndex++}`); values.push(input.contactId || null); }
            if (input.companyId !== undefined) { updates.push(`company_id = $${paramIndex++}`); values.push(input.companyId || null); }
            updates.push(`updated_at = NOW()`);

            values.push(id);
            const row = await queryOne(
                `UPDATE deals SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
                values
            );
            return toCamelCase(row);
        },
        deleteDeal: async (_: any, { id }: { id: string }) => {
            await query('DELETE FROM deals WHERE id = $1', [id]);
            return true;
        },

        // Activities
        createActivity: async (_: any, { input }: { input: any }) => {
            const row = await queryOne(
                `INSERT INTO activities (type, subject, description, due_date, contact_id, deal_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [input.type, input.subject, input.description, input.dueDate, input.contactId, input.dealId]
            );
            return toCamelCase(row);
        },
        updateActivity: async (_: any, { id, input }: { id: string; input: any }) => {
            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (input.type !== undefined) { updates.push(`type = $${paramIndex++}`); values.push(input.type); }
            if (input.subject !== undefined) { updates.push(`subject = $${paramIndex++}`); values.push(input.subject); }
            if (input.description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(input.description); }
            if (input.dueDate !== undefined) { updates.push(`due_date = $${paramIndex++}`); values.push(input.dueDate); }
            if (input.completed !== undefined) {
                updates.push(`completed = $${paramIndex++}`);
                values.push(input.completed);
                if (input.completed) {
                    updates.push(`completed_at = NOW()`);
                }
            }
            if (input.contactId !== undefined) { updates.push(`contact_id = $${paramIndex++}`); values.push(input.contactId || null); }
            if (input.dealId !== undefined) { updates.push(`deal_id = $${paramIndex++}`); values.push(input.dealId || null); }
            updates.push(`updated_at = NOW()`);

            values.push(id);
            const row = await queryOne(
                `UPDATE activities SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
                values
            );
            return toCamelCase(row);
        },
        deleteActivity: async (_: any, { id }: { id: string }) => {
            await query('DELETE FROM activities WHERE id = $1', [id]);
            return true;
        },

        // Notes
        createNote: async (_: any, { input }: { input: any }) => {
            const row = await queryOne(
                `INSERT INTO notes (content, contact_id, deal_id) VALUES ($1, $2, $3) RETURNING *`,
                [input.content, input.contactId, input.dealId]
            );
            return toCamelCase(row);
        },
        deleteNote: async (_: any, { id }: { id: string }) => {
            await query('DELETE FROM notes WHERE id = $1', [id]);
            return true;
        },
    },

    // Type Resolvers
    Contact: {
        company: async (parent: any) => {
            if (!parent.companyId) return null;
            const row = await queryOne('SELECT * FROM companies WHERE id = $1', [parent.companyId]);
            return toCamelCase(row);
        },
        deals: async (parent: any) => {
            const rows = await query('SELECT * FROM deals WHERE contact_id = $1', [parent.id]);
            return toCamelCaseArray(rows);
        },
        activities: async (parent: any) => {
            const rows = await query('SELECT * FROM activities WHERE contact_id = $1', [parent.id]);
            return toCamelCaseArray(rows);
        },
        notes: async (parent: any) => {
            const rows = await query('SELECT * FROM notes WHERE contact_id = $1', [parent.id]);
            return toCamelCaseArray(rows);
        },
    },

    Company: {
        contacts: async (parent: any) => {
            const rows = await query('SELECT * FROM contacts WHERE company_id = $1', [parent.id]);
            return toCamelCaseArray(rows);
        },
        deals: async (parent: any) => {
            const rows = await query('SELECT * FROM deals WHERE company_id = $1', [parent.id]);
            return toCamelCaseArray(rows);
        },
    },

    Deal: {
        contact: async (parent: any) => {
            if (!parent.contactId) return null;
            const row = await queryOne('SELECT * FROM contacts WHERE id = $1', [parent.contactId]);
            return toCamelCase(row);
        },
        company: async (parent: any) => {
            if (!parent.companyId) return null;
            const row = await queryOne('SELECT * FROM companies WHERE id = $1', [parent.companyId]);
            return toCamelCase(row);
        },
        activities: async (parent: any) => {
            const rows = await query('SELECT * FROM activities WHERE deal_id = $1', [parent.id]);
            return toCamelCaseArray(rows);
        },
        notes: async (parent: any) => {
            const rows = await query('SELECT * FROM notes WHERE deal_id = $1', [parent.id]);
            return toCamelCaseArray(rows);
        },
    },

    Activity: {
        contact: async (parent: any) => {
            if (!parent.contactId) return null;
            const row = await queryOne('SELECT * FROM contacts WHERE id = $1', [parent.contactId]);
            return toCamelCase(row);
        },
        deal: async (parent: any) => {
            if (!parent.dealId) return null;
            const row = await queryOne('SELECT * FROM deals WHERE id = $1', [parent.dealId]);
            return toCamelCase(row);
        },
    },

    Note: {
        contact: async (parent: any) => {
            if (!parent.contactId) return null;
            const row = await queryOne('SELECT * FROM contacts WHERE id = $1', [parent.contactId]);
            return toCamelCase(row);
        },
        deal: async (parent: any) => {
            if (!parent.dealId) return null;
            const row = await queryOne('SELECT * FROM deals WHERE id = $1', [parent.dealId]);
            return toCamelCase(row);
        },
    },
};
