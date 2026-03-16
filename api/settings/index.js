const clientPromise = require('../_lib/mongodb');
const { verifyToken, extractToken } = require('../_lib/jwt');

const DEFAULT_SETTINGS = {
    reminders_enabled: true,
    reminder_hours_before: 24,
    google_calendar_configured: false,
    google_calendar_connected: false,
    google_calendar_email: null,
};

module.exports = async (req, res) => {
    const token = extractToken(req);
    if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');

        if (req.method === 'GET') {
            const settings = await db.collection('settings').findOne({ _id: 'app_settings' });
            return res.status(200).json(settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS);
        }

        if (req.method === 'PUT') {
            const updates = req.body || {};
            // Remove _id from updates to avoid conflicts
            delete updates._id;

            const result = await db.collection('settings').updateOne(
                { _id: 'app_settings' },
                { $set: { ...updates, updatedAt: new Date() } },
                { upsert: true }
            );
            const settings = await db.collection('settings').findOne({ _id: 'app_settings' });
            return res.status(200).json({ ...DEFAULT_SETTINGS, ...settings });
        }

        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    } catch (error) {
        console.error('Error with settings:', error);
        return res.status(500).json({ message: 'Error managing settings', error: error.message });
    }
};
