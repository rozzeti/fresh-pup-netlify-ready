// GET /api/memberships — list membership plans
const { requireAuth } = require("./_auth");

const DEFAULT_MEMBERSHIPS = [
  { id: "1", name: "Basic", price: 29.99, description: "1 bath per month", active: true },
  { id: "2", name: "Standard", price: 49.99, description: "1 full groom per month", active: true },
  { id: "3", name: "Premium", price: 79.99, description: "2 full grooms per month + nail trim", active: true },
];

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json(DEFAULT_MEMBERSHIPS);
  }

  return res.status(405).json({ detail: "Method not allowed" });
};
