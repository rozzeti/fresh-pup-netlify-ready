// POST /api/oauth/calendar/disconnect — disconnect Google Calendar
const { requireAuth } = require("../../_auth");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAuth(req, res)) return;

  return res.status(200).json({ message: "Google Calendar disconnected" });
};
