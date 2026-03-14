const clientPromise = require('../lib/mongodb');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');

        const blocked = await db.collection('availability')
            .find({ blocked: true })
            .sort({ date: 1 })
            .toArray();

        return res.status(200).json(blocked);
    } catch (error) {
        console.error('Error fetching availability:', error);
        return res.status(500).json({ message: 'Error fetching availability', error: error.message });
    }
};
