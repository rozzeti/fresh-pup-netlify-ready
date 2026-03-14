#!/usr/bin/env node
/**
 * scripts/seed-admin.js
 *
 * Creates (or updates) the initial admin user in MongoDB so you can log in to
 * the Fresh Pup admin dashboard.
 *
 * Usage:
 *   node scripts/seed-admin.js
 *
 * Override the defaults with environment variables:
 *   ADMIN_USERNAME=myadmin ADMIN_PASSWORD=supersecret node scripts/seed-admin.js
 *
 * Requires:
 *   MONGODB_URI in .env (or the current environment)
 */

'use strict';

require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI environment variable is not set.');
    console.error('Copy .env.example to .env and fill in your MongoDB connection string.');
    process.exit(1);
}

async function main() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB.');

        const db = client.db('freshpup');
        const admins = db.collection('admins');

        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

        const result = await admins.updateOne(
            { username: ADMIN_USERNAME },
            {
                $set: {
                    username: ADMIN_USERNAME,
                    passwordHash,
                    role: 'admin',
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    createdAt: new Date(),
                },
            },
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            console.log(`✅ Admin user "${ADMIN_USERNAME}" created successfully.`);
        } else {
            console.log(`✅ Admin user "${ADMIN_USERNAME}" updated successfully.`);
        }

        if (ADMIN_PASSWORD === 'changeme123') {
            console.warn('⚠️  You are using the default password. Change it before going to production!');
        }
    } finally {
        await client.close();
    }
}

main().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
