// PUT /api/services/:id — update a service
// DELETE /api/services/:id — delete a service
const { requireAuth } = require("../_auth");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAuth(req, res)) return;

  const { id } = req.query;

  if (req.method === "PUT") {
    return res.status(200).json({ id, ...req.body, updated_at: new Date().toISOString() });
  }

  if (req.method === "DELETE") {
    return res.status(200).json({ message: "Service deleted" });
  }

  return res.status(405).json({ detail: "Method not allowed" });
};
