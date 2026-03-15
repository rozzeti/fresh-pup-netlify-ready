const clientPromise = require('./_lib/mongodb');
const { verifyToken } = require('./_lib/jwt');

module.exports = async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const bookingData = req.body;

            const requiredFields = ['ownerName', 'dogName', 'phone', 'service', 'dogSize', 'date', 'time'];
            const missingFields = requiredFields.filter((f) => !bookingData[f]);
            if (missingFields.length > 0) {
                return res.status(400).json({ message: `Missing required booking fields: ${missingFields.join(', ')}` });
            }

            const client = await clientPromise;
            const db = client.db('freshpup');
            const bookingsCollection = db.collection('bookings');

            const booking = {
                ...bookingData,
                createdAt: new Date(),
                status: 'pending',
            };

            const result = await bookingsCollection.insertOne(booking);

            return res.status(201).json({ message: 'Booking created successfully', bookingId: result.insertedId });
        } catch (error) {
            console.error('Error creating booking:', error);
            return res.status(500).json({ message: 'Error saving booking', error: error.message });
        }
    }

    if (req.method === 'GET') {
        const token = req.cookies && req.cookies.admin_token;
        const verified = verifyToken(token);
        if (!verified) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('freshpup');
            const bookings = await db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray();

            return res.status(200).json(bookings);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return res.status(500).json({ message: 'Error fetching bookings', error: error.message });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};
