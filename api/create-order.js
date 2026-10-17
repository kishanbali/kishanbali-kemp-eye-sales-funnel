const crypto = require("crypto");
const { getPool } = require("../lib/db");
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  try {
    const keyId = process.env.RAZORPAY_KEY_ID, keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return res.status(500).json({error:"Payment service is not configured"});
    const bump = Boolean(req.body && req.body.bump);
    const amount = bump ? 14800 : 9900;
    const receipt = "kemp_" + crypto.randomBytes(10).toString("hex");
    const auth = Buffer.from(keyId + ":" + keySecret).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method:"POST", headers:{"Authorization":"Basic " + auth,"Content-Type":"application/json"},
      body:JSON.stringify({amount,currency:"INR",receipt,notes:{product:"KEMP EYE Digital Reset",order_bump:bump ? "yes" : "no"}})
    });
    const data = await response.json();
    if (!response.ok || !data.id) return res.status(502).json({error:"Razorpay could not create the order"});
    await getPool().query(
      "INSERT INTO orders (razorpay_order_id, amount_paise, order_bump, status, created_at) VALUES ($1,$2,$3,'created',NOW())",
      [data.id, amount, bump]
    );
    return res.status(200).json({keyId, orderId:data.id, amount, currency:"INR"});
  } catch (e) { console.error("create-order error", e.message); return res.status(500).json({error:"Unable to create order"}); }
};