(async function(){
  const status=document.getElementById("delivery-status"), detail=document.getElementById("delivery-detail");
  const token=new URLSearchParams(location.search).get("token");
  if(!token){status.textContent="No access token was provided.";return;}
  try{
    const response=await fetch("/api/access?token="+encodeURIComponent(token));
    const data=await response.json();
    if(!response.ok) throw new Error(data.error||"Access could not be verified.");
    status.textContent="Payment verified successfully.";
    const p=document.createElement("p");p.textContent=data.deliveryMessage;detail.appendChild(p);
    const b=document.createElement("p");b.textContent=data.bonusIncluded?"Your order includes the optional bonus pack.":"Your order is for the main product only.";detail.appendChild(b);
  }catch(e){status.textContent=e.message||"Unable to verify access. Please contact support with your payment receipt.";}
})();