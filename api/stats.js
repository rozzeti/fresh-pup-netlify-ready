// GET /api/stats — returns dashboard statistics
const { requireAuth } = require("./_auth");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAuth(req, res)) return;

  return res.status(200).json({
    total_bookings: 0,
    pending_bookings: 0,
    completed_bookings: 0,
    total_revenue: 0,
    new_contacts: 0,
  });
};
