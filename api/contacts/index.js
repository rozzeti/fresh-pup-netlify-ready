const clientPromise = require('../_lib/mongodb');
const { verifyToken, extractToken } = require('../_lib/jwt');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const token = extractToken(req);
    if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');
        const contacts = await db.collection('contacts').find({}).sort({ createdAt: -1 }).toArray();
        return res.status(200).json(
            contacts.map((c) => ({
                id: c._id.toString(),
                name: c.name,
                email: c.email,
                phone: c.phone || '',
                message: c.message,
                is_read: c.is_read || false,
                createdAt: c.createdAt,
            }))
        );
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return res.status(500).json({ message: 'Error fetching contacts', error: error.message });
    }
};
