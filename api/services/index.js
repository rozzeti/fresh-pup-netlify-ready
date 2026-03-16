const clientPromise = require('../_lib/mongodb');
const { verifyToken, extractToken } = require('../_lib/jwt');

function mapService(s) {
    const effectivePrice = s.basePrice || s.base_price || s.price || 0;
    return {
        id: s._id.toString(),
        name: s.name,
        description: s.description || '',
        basePrice: effectivePrice,
        base_price: effectivePrice,
        price: effectivePrice,
        duration: s.duration || '',
        category: s.category || 'grooming',
        is_mobile: s.is_mobile || false,
        prices_by_size: s.prices_by_size || null,
    };
}

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        try {
            const client = await clientPromise;
            const db = client.db('freshpup');
            const services = await db.collection('services').find({}).sort({ name: 1 }).toArray();
            return res.status(200).json(services.map(mapService));
        } catch (error) {
            console.error('Error fetching services:', error);
            return res.status(500).json({ message: 'Error fetching services', error: error.message });
        }
    }

    if (req.method === 'POST') {
        const token = extractToken(req);
        if (!verifyToken(token)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { name, description, basePrice, base_price, price, duration, category, is_mobile, prices_by_size } = req.body || {};
        const effectivePrice = basePrice != null ? basePrice : (base_price != null ? base_price : price);
        if (!name || effectivePrice == null) {
            return res.status(400).json({ message: 'name and price are required.' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('freshpup');
            const result = await db.collection('services').insertOne({
                name,
                description: description || '',
                basePrice: Number(effectivePrice),
                price: Number(effectivePrice),
                duration: duration || '',
                category: category || 'grooming',
                is_mobile: is_mobile || false,
                prices_by_size: prices_by_size || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const service = await db.collection('services').findOne({ _id: result.insertedId });
            return res.status(201).json(mapService(service));
        } catch (error) {
            console.error('Error creating service:', error);
            return res.status(500).json({ message: 'Error creating service.', error: error.message });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};
