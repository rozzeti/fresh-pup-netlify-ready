const bcrypt = require('bcryptjs');
const clientPromise = require('../_lib/mongodb');
const { signToken } = require('../_lib/jwt');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');
        const admin = await db.collection('admins').findOne({ username });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const token = signToken({ sub: admin._id.toString(), role: 'admin' });

        res.setHeader(
            'Set-Cookie',
            `admin_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${
                process.env.NODE_ENV === 'production' ? '; Secure' : ''
            }`
        );

        return res.status(200).json({ message: 'Login successful.' });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};