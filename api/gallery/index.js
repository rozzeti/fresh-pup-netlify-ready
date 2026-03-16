const clientPromise = require('../_lib/mongodb');

const DEFAULT_GALLERY = [
    {
        id: '1',
        url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
        title: 'Happy Golden Retriever',
    },
    {
        id: '2',
        url: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?auto=format&fit=crop&w=800&q=80',
        title: 'Fluffy White Poodle',
    },
    {
        id: '3',
        url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
        title: 'Playful Pups',
    },
];

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');
        const images = await db.collection('gallery').find({}).sort({ createdAt: -1 }).toArray();

        if (images.length === 0) {
            return res.status(200).json(DEFAULT_GALLERY);
        }

        return res.status(200).json(
            images.map((img) => ({
                id: img._id.toString(),
                url: img.url,
                title: img.title || '',
                createdAt: img.createdAt,
            }))
        );
    } catch (error) {
        console.error('Error fetching gallery:', error);
        return res.status(200).json(DEFAULT_GALLERY);
    }
};
