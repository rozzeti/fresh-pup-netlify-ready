const { ObjectId } = require('mongodb');
const clientPromise = require('../_lib/mongodb');
const { verifyToken, extractToken } = require('../_lib/jwt');

function mapService(s) {
    return {
        id: s._id.toString(),
        name: s.name,
        description: s.description || '',
        basePrice: s.basePrice || s.price || 0,
        price: s.basePrice || s.price || 0,
        duration: s.duration || '',
        category: s.category || 'grooming',
        is_mobile: s.is_mobile || false,
        prices_by_size: s.prices_by_size || null,
    };
}

module.exports = async (req, res) => {
    const { action } = req.query;

    // Handle dynamic service ID: PUT /api/services/:id and DELETE /api/services/:id
    if (action && ObjectId.isValid(action) && action.length === 24) {
        const token = extractToken(req);
        if (!verifyToken(token)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (req.method === 'PUT') {
            const { name, description, basePrice, price, duration, category, is_mobile, prices_by_size } = req.body || {};
            const effectivePrice = basePrice != null ? basePrice : price;
            if (!name || effectivePrice == null) {
                return res.status(400).json({ message: 'name and price are required.' });
            }
            try {
                const client = await clientPromise;
                const db = client.db('freshpup');
                const result = await db.collection('services').updateOne(
                    { _id: new ObjectId(action) },
                    {
                        $set: {
                            name,
                            description: description || '',
                            basePrice: Number(effectivePrice),
                            price: Number(effectivePrice),
                            duration: duration || '',
                            category: category || 'grooming',
                            is_mobile: is_mobile || false,
                            prices_by_size: prices_by_size || null,
                            updatedAt: new Date(),
                        },
                    }
                );
                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: 'Service not found.' });
                }
                const service = await db.collection('services').findOne({ _id: new ObjectId(action) });
                return res.status(200).json(mapService(service));
            } catch (error) {
                console.error('Error updating service:', error);
                return res.status(500).json({ message: 'Error updating service.', error: error.message });
            }
        }

        if (req.method === 'DELETE') {
            try {
                const client = await clientPromise;
                const db = client.db('freshpup');
                const result = await db.collection('services').deleteOne({ _id: new ObjectId(action) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Service not found.' });
                }
                return res.status(200).json({ message: 'Service deleted.' });
            } catch (error) {
                console.error('Error deleting service:', error);
                return res.status(500).json({ message: 'Error deleting service.', error: error.message });
            }
        }

        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    if (action === 'list' || action === 'all') {
        if (req.method !== 'GET') {
            res.setHeader('Allow', ['GET']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }

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

    // Remaining write actions require admin auth
    const token = extractToken(req);
    if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (action === 'create') {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }

        const { name, description, basePrice, duration } = req.body || {};
        if (!name || basePrice == null) {
            return res.status(400).json({ message: 'Name and basePrice are required.' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('freshpup');
            const result = await db.collection('services').insertOne({
                name,
                description: description || '',
                basePrice: Number(basePrice),
                price: Number(basePrice),
                duration: duration || '',
                createdAt: new Date(),
            });
            return res.status(201).json({ message: 'Service created.', serviceId: result.insertedId });
        } catch (error) {
            console.error('Error creating service:', error);
            return res.status(500).json({ message: 'Error creating service.', error: error.message });
        }
    }

    if (action === 'update') {
        if (req.method !== 'PUT') {
            res.setHeader('Allow', ['PUT']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }

        const { id, name, description, basePrice, duration } = req.body || {};
        if (!id || !name || basePrice == null) {
            return res.status(400).json({ message: 'id, name, and basePrice are required.' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('freshpup');
            const result = await db.collection('services').updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        name,
                        description: description || '',
                        basePrice: Number(basePrice),
                        price: Number(basePrice),
                        duration: duration || '',
                        updatedAt: new Date(),
                    },
                }
            );
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Service not found.' });
            }
            return res.status(200).json({ message: 'Service updated.' });
        } catch (error) {
            console.error('Error updating service:', error);
            return res.status(500).json({ message: 'Error updating service.', error: error.message });
        }
    }

    if (action === 'delete') {
        if (req.method !== 'DELETE') {
            res.setHeader('Allow', ['DELETE']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }

        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'Service id is required as a query parameter.' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('freshpup');
            const result = await db.collection('services').deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Service not found.' });
            }
            return res.status(200).json({ message: 'Service deleted.' });
        } catch (error) {
            console.error('Error deleting service:', error);
            return res.status(500).json({ message: 'Error deleting service.', error: error.message });
        }
    }

    return res.status(404).json({ message: 'Not found.' });
};

module.exports = async (req, res) => {
    const { action } = req.query;

    if (action === 'list') {
        if (req.method !== 'GET') {
            res.setHeader('Allow', ['GET']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }

        try {
            const client = await clientPromise;
            const db = client.db('freshpup');
            const services = await db.collection('services').find({}).sort({ name: 1 }).toArray();
            return res.status(200).json(services);
        } catch (error) {
            console.error('Error fetching services:', error);
            return res.status(500).json({ message: 'Error fetching services', error: error.message });
        }
    }

    // All remaining actions require admin authentication
    const token = req.cookies && req.cookies.admin_token;
    if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (action === 'create') {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }

        const { name, description, basePrice, duration } = req.body || {};
        if (!name || basePrice == null) {
            return res.status(400).json({ message: 'Name and basePrice are required.' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('freshpup');
            const result = await db.collection('services').insertOne({
                name,
                description: description || '',
                basePrice: Number(basePrice),
                duration: duration || '',
                createdAt: new Date(),
            });
            return res.status(201).json({ message: 'Service created.', serviceId: result.insertedId });
        } catch (error) {
            console.error('Error creating service:', error);
            return res.status(500).json({ message: 'Error creating service.', error: error.message });
        }
    }

    if (action === 'update') {
        if (req.method !== 'PUT') {
            res.setHeader('Allow', ['PUT']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }

        const { id, name, description, basePrice, duration } = req.body || {};
        if (!id || !name || basePrice == null) {
            return res.status(400).json({ message: 'id, name, and basePrice are required.' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('freshpup');
            const result = await db.collection('services').updateOne(
                { _id: new ObjectId(id) },
                { $set: { name, description: description || '', basePrice: Number(basePrice), duration: duration || '', updatedAt: new Date() } }
            );
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Service not found.' });
            }
            return res.status(200).json({ message: 'Service updated.' });
        } catch (error) {
            console.error('Error updating service:', error);
            return res.status(500).json({ message: 'Error updating service.', error: error.message });
        }
    }

    if (action === 'delete') {
        if (req.method !== 'DELETE') {
            res.setHeader('Allow', ['DELETE']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }

        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'Service id is required as a query parameter.' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('freshpup');
            const result = await db.collection('services').deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Service not found.' });
            }
            return res.status(200).json({ message: 'Service deleted.' });
        } catch (error) {
            console.error('Error deleting service:', error);
            return res.status(500).json({ message: 'Error deleting service.', error: error.message });
        }
    }

    return res.status(404).json({ message: 'Not found.' });
};
