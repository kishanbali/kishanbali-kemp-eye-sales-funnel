const bump = document.getElementById("order-bump");
const total = document.getElementById("total");
const button = document.getElementById("buy-button");
const statusBox = document.getElementById("status");
bump.addEventListener("change", () => { total.textContent = bump.checked ? "₹148" : "₹99"; });
button.addEventListener("click", async () => {
  button.disabled = true; statusBox.textContent = "Preparing secure checkout…";
  try {
    const orderRes = await fetch("/api/create-order", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bump:bump.checked})});
    const order = await orderRes.json();
    if (!orderRes.ok) throw new Error(order.error || "Could not create order.");
    const checkout = new Razorpay({
      key: order.keyId, amount: order.amount, currency: "INR", order_id: order.orderId,
      name: "KEMP EYE", description: bump.checked ? "Digital Reset + Bonus Pack" : "KEMP EYE Digital Reset",
      prefill: {}, theme: {color:"#e7c77b"},
      handler: async function (response) {
        statusBox.textContent = "Verifying payment securely…";
        try {
          const verifyRes = await fetch("/api/verify-payment", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(response)});
          const result = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(result.error || "Payment verification failed.");
          window.location.href = "/delivery.html?token=" + encodeURIComponent(result.token);
        } catch (err) { statusBox.textContent = err.message || "Verification failed. Contact support with your payment receipt."; button.disabled = false; }
      },
      modal: { ondismiss: () => { button.disabled = false; statusBox.textContent = "Checkout closed. You can try again."; } }
    });
    checkout.on("payment.failed", function () { statusBox.textContent = "Payment did not complete. Please try again."; button.disabled = false; });
    checkout.open();
  } catch (err) { statusBox.textContent = err.message || "Unable to start checkout."; button.disabled = false; }
});