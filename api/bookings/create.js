const clientPromise = require('../lib/mongodb');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    try {
        const bookingData = req.body;

        if (!bookingData.ownerName || !bookingData.dogName || !bookingData.phone || !bookingData.service || !bookingData.dogSize || !bookingData.date || !bookingData.time) {
            return res.status(400).json({ message: 'Missing required booking fields' });
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