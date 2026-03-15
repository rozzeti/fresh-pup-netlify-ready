module.exports = (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    res.setHeader(
        'Set-Cookie',
        'admin_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
    );

    return res.status(200).json({ message: 'Logged out.' });
};
