// POST /api/auth/register
// Registration is disabled — only the admin account (set via env vars) is supported.
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  return res.status(403).json({ detail: "Registration is disabled. Use the admin account configured in environment variables." });
};
