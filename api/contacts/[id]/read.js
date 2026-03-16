const { ObjectId } = require('mongodb');
const clientPromise = require('../../_lib/mongodb');
const { verifyToken, extractToken } = require('../../_lib/jwt');

module.exports = async (req, res) => {
    if (req.method !== 'PUT') {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const token = extractToken(req);
    if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid contact id.' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');
        const result = await db.collection('contacts').updateOne(
            { _id: new ObjectId(id) },
            { $set: { is_read: true, readAt: new Date() } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Contact not found.' });
        }
        return res.status(200).json({ message: 'Marked as read.', id });
    } catch (error) {
        console.error('Error marking contact as read:', error);
        return res.status(500).json({ message: 'Error updating contact', error: error.message });
    }
};
