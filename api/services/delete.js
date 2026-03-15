const { ObjectId } = require('mongodb');
const clientPromise = require('../_lib/mongodb');
const { verifyToken } = require('../_lib/jwt');

module.exports = async (req, res) => {
    if (req.method !== 'DELETE') {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const token = req.cookies && req.cookies.admin_token;
    if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Service id is required as a query parameter.' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');
        const result = await db.collection('services').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Service not found.' });
        }

        return res.status(200).json({ message: 'Service deleted.' });
    } catch (error) {
        console.error('Error deleting service:', error);
        return res.status(500).json({ message: 'Error deleting service.', error: error.message });
    }
};
