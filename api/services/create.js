const { ObjectId } = require('mongodb');
const clientPromise = require('../_lib/mongodb');
const { verifyToken } = require('../_lib/jwt');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const token = req.cookies && req.cookies.admin_token;
    if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, description, basePrice, duration } = req.body || {};

    if (!name || basePrice == null) {
        return res.status(400).json({ message: 'Name and basePrice are required.' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');
        const result = await db.collection('services').insertOne({
            name,
            description: description || '',
            basePrice: Number(basePrice),
            duration: duration || '',
            createdAt: new Date(),
        });

        return res.status(201).json({ message: 'Service created.', serviceId: result.insertedId });
    } catch (error) {
        console.error('Error creating service:', error);
        return res.status(500).json({ message: 'Error creating service.', error: error.message });
    }
};
