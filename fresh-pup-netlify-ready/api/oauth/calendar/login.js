// GET /api/oauth/calendar/login — Google Calendar OAuth (not configured)
const { requireAuth } = require("../../_auth");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAuth(req, res)) return;

  return res.status(501).json({
    detail: "Google Calendar integration requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.",
  });
};
