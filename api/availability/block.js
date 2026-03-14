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

    const { date, timeSlots, blocked } = req.body || {};

    if (!date) {
        return res.status(400).json({ message: 'Date is required' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');

        await db.collection('availability').updateOne(
            { date },
            {
                $set: {
                    date,
                    timeSlots: timeSlots || [],
                    blocked: blocked !== false,
                    updatedAt: new Date(),
                },
            },
            { upsert: true }
        );

        return res.status(200).json({ message: 'Availability updated' });
    } catch (error) {
        console.error('Error updating availability:', error);
        return res.status(500).json({ message: 'Error updating availability', error: error.message });
    }
};
