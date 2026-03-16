const clientPromise = require('../_lib/mongodb');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const { name, email, phone, message } = req.body || {};
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'name, email, and message are required.' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');
        await db.collection('contacts').insertOne({
            name,
            email,
            phone: phone || '',
            message,
            is_read: false,
            createdAt: new Date(),
        });
        return res.status(200).json({ message: 'Message received. We\'ll get back to you soon!' });
    } catch (error) {
        console.error('Error saving contact:', error);
        return res.status(500).json({ message: 'Error sending message', error: error.message });
    }
};
