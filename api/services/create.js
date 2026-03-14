const clientPromise = require('../lib/mongodb');
const { verifyToken } = require('../lib/jwt');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const token = req.cookies && req.cookies.admin_token;
    if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, description, basePrice, duration } = req.body || {};

    if (!name || basePrice === undefined) {
        return res.status(400).json({ message: 'Name and basePrice are required' });
    }

    const parsedPrice = Number(basePrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ message: 'basePrice must be a non-negative number' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');

        const service = {
            name,
            description: description || '',
            basePrice: parsedPrice,
            duration: duration || '',
            createdAt: new Date(),
        };

        const result = await db.collection('services').insertOne(service);

        return res.status(201).json({ message: 'Service created', serviceId: result.insertedId });
    } catch (error) {
        console.error('Error creating service:', error);
        return res.status(500).json({ message: 'Error creating service', error: error.message });
    }
};

