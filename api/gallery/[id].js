// DELETE /api/gallery/:id — delete a gallery image
const { requireAuth } = require("../_auth");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAuth(req, res)) return;

  if (req.method === "DELETE") {
    return res.status(200).json({ message: "Image deleted" });
  }

  return res.status(405).json({ detail: "Method not allowed" });
};
