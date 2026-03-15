const { ObjectId } = require('mongodb');
const clientPromise = require('../_lib/mongodb');
const { verifyToken } = require('../_lib/jwt');

module.exports = async (req, res) => {
    if (req.method !== 'PUT') {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const token = req.cookies && req.cookies.admin_token;
    if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id, name, description, basePrice, duration } = req.body || {};

    if (!id || !name || basePrice == null) {
        return res.status(400).json({ message: 'id, name, and basePrice are required.' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');
        const result = await db.collection('services').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    name,
                    description: description || '',
                    basePrice: Number(basePrice),
                    duration: duration || '',
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Service not found.' });
        }

        return res.status(200).json({ message: 'Service updated.' });
    } catch (error) {
        console.error('Error updating service:', error);
        return res.status(500).json({ message: 'Error updating service.', error: error.message });
    }
};
