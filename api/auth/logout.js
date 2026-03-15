module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    res.setHeader(
        'Set-Cookie',
        'admin_token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0'
    );

    return res.status(200).json({ message: 'Logged out successfully' });
};
