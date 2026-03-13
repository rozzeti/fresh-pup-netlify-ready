// Shared helper to require authentication on API routes
const { verify, extractToken } = require("./_jwt");

function requireAuth(req, res) {
  try {
    const token = extractToken(req);
    return verify(token);
  } catch {
    res.status(401).json({ detail: "Not authenticated" });
    return null;
  }
}

module.exports = { requireAuth };
