const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const clientPromise = require('../_lib/mongodb');
const { signToken, verifyToken, extractToken } = require('../_lib/jwt');

module.exports = async (req, res) => {
    const { action } = req.query;

    if (action === 'login') {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }

        const { username, email, password } = req.body || {};
        const identifier = email || username;
        if (!identifier || !password) {
            return res.status(400).json({ message: 'Email/username and password are required.' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('freshpup');
            const admin = await db.collection('admins').findOne({
                $or: [{ email: identifier }, { username: identifier }],
            });

            if (!admin) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            const isValid = await bcrypt.compare(password, admin.passwordHash);
            if (!isValid) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            const token = signToken({ sub: admin._id.toString(), role: 'admin' });

            const isSecure =
                process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
            res.setHeader(
                'Set-Cookie',
                `admin_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${isSecure ? '; Secure' : ''}`
            );

            return res.status(200).json({
                message: 'Login successful.',
                access_token: token,
                user: {
                    id: admin._id.toString(),
                    email: admin.email || admin.username,
                    name: admin.name || admin.email || admin.username,
                    role: 'admin',
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    if (action === 'logout') {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }

        res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
        return res.status(200).json({ message: 'Logged out.' });
    }

    if (action === 'me') {
        if (req.method !== 'GET') {
            res.setHeader('Allow', ['GET']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }

        const token = extractToken(req);
        const payload = verifyToken(token);
        if (!payload) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('freshpup');
            const admin = await db.collection('admins').findOne({ _id: new ObjectId(payload.sub) });
            if (!admin) {
                return res.status(401).json({ message: 'User not found.' });
            }
            return res.status(200).json({
                id: admin._id.toString(),
                email: admin.email || admin.username,
                name: admin.name || admin.email || admin.username,
                role: 'admin',
            });
        } catch (error) {
            console.error('Auth me error:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    if (action === 'register') {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }

        try {
            const client = await clientPromise;
            const db = client.db('freshpup');

            // Only allow registration if no admins exist yet
            const adminCount = await db.collection('admins').countDocuments();
            if (adminCount > 0) {
                return res.status(403).json({
                    message: 'Registration is disabled. Use the seed endpoint or contact your administrator.',
                });
            }

            const { email, password, name } = req.body || {};
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required.' });
            }

            const passwordHash = await bcrypt.hash(password, 12);
            const result = await db.collection('admins').insertOne({
                email,
                username: email,
                name: name || email,
                passwordHash,
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const token = signToken({ sub: result.insertedId.toString(), role: 'admin' });
            const isSecure =
                process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
            res.setHeader(
                'Set-Cookie',
                `admin_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${isSecure ? '; Secure' : ''}`
            );

            return res.status(201).json({
                message: 'Admin registered.',
                access_token: token,
                user: {
                    id: result.insertedId.toString(),
                    email,
                    name: name || email,
                    role: 'admin',
                },
            });
        } catch (error) {
            console.error('Register error:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    return res.status(404).json({ message: 'Not found.' });
};
