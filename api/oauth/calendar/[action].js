const clientPromise = require('../../_lib/mongodb');
const { verifyToken, extractToken } = require('../../_lib/jwt');

module.exports = async (req, res) => {
    const { action } = req.query;

    // GET /api/oauth/calendar/login — start Google Calendar OAuth flow
    if (action === 'login') {
        if (req.method !== 'GET') {
            res.setHeader('Allow', ['GET']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }

        const token = extractToken(req);
        if (!verifyToken(token)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Stub: return a placeholder URL. Configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
        // and GOOGLE_REDIRECT_URI environment variables to enable real OAuth.
        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(503).json({
                message: 'Google Calendar integration is not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.',
            });
        }

        const params = new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            response_type: 'code',
            scope: 'https://www.googleapis.com/auth/calendar.events',
            access_type: 'offline',
            prompt: 'consent',
        });

        return res.status(200).json({
            authorization_url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
        });
    }

    // POST /api/oauth/calendar/disconnect — disconnect Google Calendar
    if (action === 'disconnect') {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }

        const token = extractToken(req);
        if (!verifyToken(token)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('freshpup');
            await db.collection('settings').updateOne(
                { _id: 'app_settings' },
                {
                    $set: {
                        google_calendar_connected: false,
                        google_calendar_email: null,
                        google_calendar_token: null,
                        updatedAt: new Date(),
                    },
                },
                { upsert: true }
            );
            return res.status(200).json({ message: 'Google Calendar disconnected.' });
        } catch (error) {
            console.error('Error disconnecting Google Calendar:', error);
            return res.status(500).json({ message: 'Error disconnecting', error: error.message });
        }
    }

    return res.status(404).json({ message: 'Not found.' });
};
