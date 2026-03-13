// POST /api/auth/login
// Authenticates the admin user using ADMIN_EMAIL and ADMIN_PASSWORD environment variables.
// Returns a JWT token on success.
const crypto = require("crypto");
const { sign } = require("../_jwt");

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still run the comparison to avoid early-exit timing leak, but always fail
    crypto.timingSafeEqual(bufA, Buffer.alloc(bufA.length));
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ detail: "Method not allowed" });

  const { email, password } = req.body || {};

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return res.status(503).json({ detail: "Admin credentials are not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in Vercel environment variables." });
  }

  if (!email || !password) {
    return res.status(422).json({ detail: "Email and password are required" });
  }

  if (!timingSafeEqual(email, adminEmail) || !timingSafeEqual(password, adminPassword)) {
    return res.status(401).json({ detail: "Invalid email or password" });
  }

  const user = { id: "1", email: adminEmail, name: "Admin", role: "admin" };
  const access_token = sign({ sub: user.id, email: user.email, role: "admin", exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 });

  return res.status(200).json({ access_token, user });
};
