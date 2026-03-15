const clientPromise = require('../lib/mongodb');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

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
};