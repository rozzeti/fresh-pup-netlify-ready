// GET /api/services/all — return all services (including inactive)
const { requireAuth } = require("../_auth");

const DEFAULT_SERVICES = [
  { id: "1", name: "Bath & Brush", description: "Full bath, blow dry, and brush out", duration: 60, price_small: 45, price_medium: 55, price_large: 65, price_xlarge: 75, active: true },
  { id: "2", name: "Full Groom", description: "Bath, brush, haircut, nail trim, ear cleaning", duration: 90, price_small: 65, price_medium: 80, price_large: 95, price_xlarge: 110, active: true },
  { id: "3", name: "Nail Trim", description: "Nail clipping and filing", duration: 15, price_small: 15, price_medium: 15, price_large: 20, price_xlarge: 20, active: true },
];

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAuth(req, res)) return;
  return res.status(200).json(DEFAULT_SERVICES);
};
