const MEMBERSHIPS = [
    {
        id: '1',
        name: 'Basic Pup',
        description: 'Perfect for regular maintenance and keep your pup looking great year-round.',
        price: 49,
        frequency: 'month',
        features: [
            '2 baths per month',
            'Nail trimming included',
            'Ear cleaning',
            '10% off additional services',
            'Priority scheduling',
        ],
    },
    {
        id: '2',
        name: 'Premium Pooch',
        description: 'Our most popular plan with full grooming services for the discerning pet.',
        price: 89,
        frequency: 'month',
        features: [
            '2 full grooms per month',
            'Bath & blow dry',
            'Haircut & styling',
            'Nail trimming & filing',
            'Ear cleaning & plucking',
            '15% off additional services',
            'Priority scheduling',
            'Free teeth brushing',
        ],
    },
    {
        id: '3',
        name: 'VIP Furball',
        description: 'The ultimate pampering experience for your beloved companion.',
        price: 149,
        frequency: 'month',
        features: [
            'Unlimited baths',
            '3 full grooms per month',
            'Premium shampoo & conditioner',
            'Pawdicure with polish',
            'Bandana or bow included',
            '20% off all services',
            'Dedicated groomer',
            'Free pickup & delivery',
            'Monthly health check',
        ],
    },
];

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
    return res.status(200).json(MEMBERSHIPS);
};
