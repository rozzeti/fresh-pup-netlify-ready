// POST /api/contact — submit a contact/message form (public)
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    const { name, email, phone, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(422).json({ detail: "Name, email, and message are required" });
    }
    return res.status(201).json({ id: Date.now().toString(), name, email, phone, message, created_at: new Date().toISOString() });
  }

  return res.status(405).json({ detail: "Method not allowed" });
};
