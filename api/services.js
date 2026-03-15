const clientPromise = require('./_lib/mongodb');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');
        const services = await db.collection('services').find({}).sort({ name: 1 }).toArray();

        return res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        return res.status(500).json({ message: 'Error fetching services', error: error.message });
    }
};
