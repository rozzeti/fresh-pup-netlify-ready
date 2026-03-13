// Minimal JWT helper using Node.js built-in crypto — no external dependencies needed
const crypto = require("crypto");

function getSecret() {
  return process.env.JWT_SECRET || "fresh-pup-change-me-in-vercel-env";
}

function base64url(buf) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function sign(payload) {
  const header = base64url(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = base64url(
    Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }))
  );
  const sig = base64url(
    crypto.createHmac("sha256", getSecret()).update(`${header}.${body}`).digest()
  );
  return `${header}.${body}.${sig}`;
}

function verify(token) {
  if (!token) throw new Error("No token provided");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed token");
  const [header, body, sig] = parts;
  const expected = base64url(
    crypto.createHmac("sha256", getSecret()).update(`${header}.${body}`).digest()
  );
  if (sig !== expected) throw new Error("Invalid signature");
  const payload = JSON.parse(Buffer.from(body, "base64").toString("utf8"));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }
  return payload;
}

function extractToken(req) {
  const auth = req.headers["authorization"] || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

module.exports = { sign, verify, extractToken };
