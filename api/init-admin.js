const bcrypt = require('bcryptjs');
const clientPromise = require('./_lib/mongodb');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');
        const adminsCollection = db.collection('admins');

        const email = 'boss@freshpup.com';
        const password = 'Donquijote23!';
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const result = await adminsCollection.updateOne(
            { email },
            {
                $set: {
                    email,
                    username: email,
                    name: 'Fresh Pup Boss',
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

        const action = result.upsertedCount > 0 ? 'created' : 'updated';
        return res.status(200).json({
            message: `Admin account ${action} successfully.`,
            admin: { email },
        });
    } catch (error) {
        console.error('Init admin error:', error);
        return res.status(500).json({ message: 'Error initializing admin account' });
    }
};