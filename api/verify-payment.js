const crypto = require("crypto");
const { getPool } = require("../lib/db");
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
    if (![orderId,paymentId,signature].every(v => typeof v === "string" && v.length > 0)) return res.status(400).json({error:"Missing payment verification fields"});
    const keyId = process.env.RAZORPAY_KEY_ID, keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return res.status(500).json({error:"Payment service is not configured"});
    const db = getPool();
    const found = await db.query("SELECT amount_paise,status FROM orders WHERE razorpay_order_id=$1 LIMIT 1",[orderId]);
    if (!found.rowCount) return res.status(400).json({error:"Unknown order"});
    if (found.rows[0].status === "paid") return res.status(409).json({error:"This order has already been verified"});
    const expected = crypto.createHmac("sha256",keySecret).update(orderId + "|" + paymentId).digest();
    let supplied;
    try { supplied = Buffer.from(signature,"hex"); } catch { return res.status(400).json({error:"Invalid signature"}); }
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(expected,supplied)) return res.status(400).json({error:"Payment signature is invalid"});
    const auth = Buffer.from(keyId + ":" + keySecret).toString("base64");
    const paymentRes = await fetch("https://api.razorpay.com/v1/payments/" + encodeURIComponent(paymentId),{headers:{"Authorization":"Basic " + auth}});
    const payment = await paymentRes.json();
    const amount = Number(found.rows[0].amount_paise);
    if (!paymentRes.ok || payment.order_id !== orderId || Number(payment.amount) !== amount || payment.currency !== "INR" || payment.status !== "captured") {
      return res.status(400).json({error:"Payment is not captured or does not match this order"});
    }
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const saved = await db.query(
      "UPDATE orders SET status='paid', razorpay_payment_id=$2, token_hash=$3, token_expires_at=NOW()+INTERVAL '7 days', paid_at=NOW() WHERE razorpay_order_id=$1 AND status='created' RETURNING razorpay_order_id",
      [orderId,paymentId,tokenHash]
    );
    if (!saved.rowCount) return res.status(409).json({error:"Order was already processed"});
    return res.status(200).json({token});
  } catch (e) { console.error("verify-payment error", e.message); return res.status(500).json({error:"Unable to verify payment"}); }
};