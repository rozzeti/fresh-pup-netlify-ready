const clientPromise = require('../_lib/mongodb');
const { verifyToken } = require('../_lib/jwt');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const token = req.cookies && req.cookies.admin_token;
    const verified = verifyToken(token);
    if (!verified) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');
        const bookings = await db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray();

        return res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
};
