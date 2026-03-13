// POST /api/gallery/upload — upload a gallery image (returns a URL)
const { requireAuth } = require("../_auth");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAuth(req, res)) return;

  // Without a file storage service configured, return an informative error
  return res.status(501).json({
    detail: "Image upload requires a storage service. Configure STORAGE_PROVIDER in Vercel environment variables.",
  });
};
