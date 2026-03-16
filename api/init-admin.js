const initAdmin = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, password } = req.body;

    if (email !== 'boss@freshpup.com' || password !== 'Donquijote23!') {
        return res.status(403).json({ message: 'Invalid credentials' });
    }

    // Code to initialize the admin account
    // This is where you would save the admin details to your database

    return res.status(200).json({ message: 'Admin account initialized successfully.' });
};

export default initAdmin;