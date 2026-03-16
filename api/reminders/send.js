const { verifyToken, extractToken } = require('../_lib/jwt');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const token = extractToken(req);
    if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Stub: reminder sending would be implemented with an email/SMS service
    return res.status(200).json({ message: 'Reminder task started! Reminders will be sent to upcoming appointments.' });
};
