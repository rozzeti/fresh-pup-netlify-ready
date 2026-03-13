// GET /api/auth/me
// Returns the currently authenticated user from the JWT token.
const { verify, extractToken } = require("../_jwt");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ detail: "Method not allowed" });

  try {
    const token = extractToken(req);
    const payload = verify(token);
    return res.status(200).json({ id: payload.sub, email: payload.email, name: "Admin", role: "admin" });
  } catch (err) {
    return res.status(401).json({ detail: "Not authenticated" });
  }
};
