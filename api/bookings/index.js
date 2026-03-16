const clientPromise = require('../_lib/mongodb');
const { verifyToken, extractToken } = require('../_lib/jwt');

function mapBooking(b) {
    return {
        id: b._id.toString(),
        customer_name: b.customer_name || b.ownerName || '',
        dog_name: b.dog_name || b.dogName || '',
        service_name: b.service_name || (b.service && b.service.name) || b.service || '',
        service_id: b.service_id || '',
        dog_size: b.dog_size || b.dogSize || '',
        date: b.date,
        time: b.time,
        status: b.status || 'pending',
        price: b.price || 0,
        tip_amount: b.tip_amount || b.tipAmount || 0,
        total_amount: b.total_amount || b.price || 0,
        phone: b.customer_phone || b.phone || '',
        email: b.customer_email || b.email || '',
        notes: b.notes || '',
        is_mobile_service: b.is_mobile_service || false,
        createdAt: b.createdAt,
    };
}

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const data = req.body || {};
            const requiredFields = ['service_name', 'date', 'time', 'customer_name', 'customer_phone'];
            const missing = requiredFields.filter((f) => !data[f]);
            if (missing.length > 0) {
                return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
            }
            const client = await clientPromise;
            const db = client.db('freshpup');
            const result = await db.collection('bookings').insertOne({
                ...data,
                createdAt: new Date(),
                status: 'pending',
            });
            return res.status(201).json({ message: 'Booking created successfully', bookingId: result.insertedId });
        } catch (error) {
            console.error('Error creating booking:', error);
            return res.status(500).json({ message: 'Error saving booking', error: error.message });
        }
    }

    if (req.method === 'GET') {
        const token = extractToken(req);
        if (!verifyToken(token)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        try {
            const client = await clientPromise;
            const db = client.db('freshpup');
            const bookings = await db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray();
            return res.status(200).json(bookings.map(mapBooking));
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return res.status(500).json({ message: 'Error fetching bookings', error: error.message });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};
