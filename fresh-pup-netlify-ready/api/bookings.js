// GET /api/bookings — list bookings
// POST /api/bookings — create a booking (public, for customers)
const { requireAuth } = require("./_auth");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    if (!requireAuth(req, res)) return;
    return res.status(200).json([]);
  }

  if (req.method === "POST") {
    // Public booking creation
    const booking = { id: Date.now().toString(), ...req.body, status: "pending", created_at: new Date().toISOString() };
    return res.status(201).json(booking);
  }

  return res.status(405).json({ detail: "Method not allowed" });
};
