const crypto = require("crypto");
const { getPool } = require("./_db");
module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({error:"Method not allowed"});
  try {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    if (!/^[a-f0-9]{64}$/.test(token)) return res.status(400).json({error:"Invalid access token"});
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const result = await getPool().query(
      "SELECT order_bump FROM orders WHERE token_hash=$1 AND status='paid' AND token_expires_at>NOW() LIMIT 1",[hash]
    );
    if (!result.rowCount) return res.status(403).json({error:"This access link is invalid or expired"});
    return res.status(200).json({authorized:true,product:"KEMP EYE Digital Reset",bonusIncluded:result.rows[0].order_bump,deliveryMessage:"Payment verified. The product file must be configured by the publisher before customer delivery."});
  } catch (e) { console.error("access error", e.message); return res.status(500).json({error:"Unable to check access"}); }
};