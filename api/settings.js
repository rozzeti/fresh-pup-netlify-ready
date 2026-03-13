// GET /api/settings — get business settings
// PUT /api/settings — update business settings
const { requireAuth } = require("./_auth");

const DEFAULT_SETTINGS = {
  business_name: "Fresh Pup Grooming",
  business_email: "",
  business_phone: "",
  business_address: "",
  booking_lead_time_hours: 24,
  booking_advance_days: 30,
  google_calendar_connected: false,
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAuth(req, res)) return;

  if (req.method === "GET") {
    return res.status(200).json(DEFAULT_SETTINGS);
  }

  if (req.method === "PUT") {
    return res.status(200).json({ ...DEFAULT_SETTINGS, ...req.body });
  }

  return res.status(405).json({ detail: "Method not allowed" });
};
