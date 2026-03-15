const clientPromise = require('../_lib/mongodb');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');
        const availability = await db.collection('availability').find({}).toArray();

        return res.status(200).json(availability);
    } catch (error) {
        console.error('Error fetching availability:', error);
        return res.status(500).json({ message: 'Error fetching availability.', error: error.message });
    }
};
