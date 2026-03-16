const clientPromise = require('../_lib/mongodb');
const { verifyToken, extractToken } = require('../_lib/jwt');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const token = extractToken(req);
    if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('freshpup');

        const [totalBookings, pendingBookings, confirmedBookings] = await Promise.all([
            db.collection('bookings').countDocuments(),
            db.collection('bookings').countDocuments({ status: 'pending' }),
            db.collection('bookings').countDocuments({ status: 'confirmed' }),
        ]);

        // Aggregate revenue and tips from confirmed bookings
        const revenueAgg = await db.collection('bookings').aggregate([
            { $match: { status: { $in: ['confirmed', 'completed'] } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: { $toDouble: { $ifNull: ['$price', 0] } } },
                    totalTips: { $sum: { $toDouble: { $ifNull: ['$tip_amount', 0] } } },
                },
            },
        ]).toArray();

        const revenue = revenueAgg[0] || { totalRevenue: 0, totalTips: 0 };

        return res.status(200).json({
            total_bookings: totalBookings,
            pending_bookings: pendingBookings,
            confirmed_bookings: confirmedBookings,
            total_revenue: Math.round(revenue.totalRevenue * 100) / 100,
            total_tips: Math.round(revenue.totalTips * 100) / 100,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};
