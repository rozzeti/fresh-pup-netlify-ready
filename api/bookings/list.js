// Endpoint to list bookings
const express = require('express');
const router = express.Router();

// Mock data for bookings
const bookings = [
    { id: 1, name: 'Booking 1', date: '2026-03-13', status: 'confirmed' },
    { id: 2, name: 'Booking 2', date: '2026-03-14', status: 'pending' },
];

// GET /api/bookings/list
router.get('/api/bookings/list', (req, res) => {
    res.json(bookings);
});

module.exports = router;
