// POST /api/reminders/send — send appointment reminders
const { requireAuth } = require("../_auth");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAuth(req, res)) return;

  return res.status(200).json({ message: "Reminders sent", sent: 0 });
};
