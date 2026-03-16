const bcrypt = require('bcryptjs');
const clientPromise = require('../_lib/mongodb');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');
        const adminsCollection = db.collection('admins');

        // Create admin user
        const email = 'admin@example.com';
        const password = 'changeme123';
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const result = await adminsCollection.updateOne(
            { email: email },
            {
                $set: {
                    email: email,
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

        // Create default services
        const servicesCollection = db.collection('services');
        const services = [
            { name: 'Small Grooming', description: 'Under 20 lbs', basePrice: 35, duration: '1 hour' },
            { name: 'Medium Grooming', description: '20-50 lbs', basePrice: 45, duration: '1.5 hours' },
            { name: 'Large Grooming', description: '50-80 lbs', basePrice: 55, duration: '2 hours' },
            { name: 'XLarge Grooming', description: 'Over 80 lbs', basePrice: 65, duration: '2.5 hours' },
        ];

        for (const service of services) {
            await servicesCollection.updateOne(
                { name: service.name },
                { $set: service },
                { upsert: true }
            );
        }

        return res.status(200).json({
            message: 'Admin user and services initialized successfully!',
            admin: {
                email: email,
                password: password,
            },
        });
    } catch (error) {
        console.error('Seed error:', error);
        return res.status(500).json({ message: 'Error initializing data', error: error.message });
    }
};
