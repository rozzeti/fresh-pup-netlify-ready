// GET /api/gallery — list gallery images
// POST /api/gallery — add a gallery image
const { requireAuth } = require("./_auth");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json([]);
  }

  if (req.method === "POST") {
    if (!requireAuth(req, res)) return;
    const item = { id: require("crypto").randomUUID(), ...req.body, created_at: new Date().toISOString() };
    return res.status(201).json(item);
  }

  return res.status(405).json({ detail: "Method not allowed" });
};
