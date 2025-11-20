import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase";

export default function CartDrawer() {
  const { cart, removeFromCart, updateQty, total, open, setOpen, clearCart } = useCart();
  const ref = useRef(null);

  useEffect(() => {
    async function loadGSAP() {
      try {
        if (typeof window === "undefined") return;
        if (!window.gsap) {
          await new Promise((res, rej) => {
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
            s.onload = res;
            s.onerror = rej;
            document.head.appendChild(s);
          });
        }

        const gsap = window.gsap;
        if (open) {
          gsap.to(ref.current, { x: 0, duration: 0.5, ease: "power3.out" });
        } else {
          gsap.to(ref.current, { x: "120%", duration: 0.45, ease: "power3.in" });
        }
      } catch (e) {
        console.warn("GSAP load error", e);
      }
    }
    loadGSAP();
  }, [open]);

  function handleRemove(id) {
    const el = document.getElementById("cart-item-" + id);
    if (el && window.gsap) {
      window.gsap.to(el, {
        opacity: 0,
        x: 50,
        height: 0,
        margin: 0,
        padding: 0,
        duration: 0.45,
        onComplete: () => removeFromCart(id)
      });
    } else removeFromCart(id);
  }

  return (
    <div
      ref={ref}
      className="fixed top-0 right-0 h-full w-full md:w-96 z-50 pointer-events-none"
      style={{ transform: "translateX(120%)" }}
    >
      <div className="pointer-events-auto h-full bg-gradient-to-b from-[#0b0210] to-[#050009] border-l border-gold/30 shadow-2xl p-4 flex flex-col">

        {/* ★★★★★ TOP — TOTAL + BUTTON ★★★★★ */}
        <div className="pb-4 border-b border-gold/10">
          <div className="flex items-center justify-between text-white/90 mb-3">
            <div className="text-lg font-medium">Total</div>
            <div className="text-gold font-semibold">₹{total}</div>
          </div>

          <CheckoutButton total={total} clearCart={clearCart} setOpen={setOpen} />
        </div>

        {/* HEADER */}
        <div className="flex items-center justify-between mt-4 mb-2">
          <h3 className="text-gold font-semibold text-lg">Your Cart</h3>
          <button onClick={() => setOpen(false)} className="text-white/80">Close</button>
        </div>

        {/* ITEMS LIST */}
        <div className="flex-1 overflow-auto space-y-3 mt-2 mb-4">
          {cart.length === 0 && <div className="text-white/70">Cart is empty</div>}

          {cart.map((it) => (
            <div
              key={it.id}
              id={"cart-item-" + it.id}
              className="flex items-center gap-3 bg-[#09020a] p-3 rounded-lg border border-gold/10"
            >
              <img src={it.image} className="w-16 h-12 object-cover rounded" alt="" />

              <div className="flex-1">
                <div className="text-white font-medium">{it.title}</div>
                <div className="text-sm text-white/60">₹{it.price} × {it.qty}</div>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => updateQty(it.id, Math.max(0, (it.qty || 1) - 1))}
                    className="px-2 py-1 bg-black/40 rounded"
                  >
                    -
                  </button>
                  <div className="px-3">{it.qty}</div>
                  <button
                    onClick={() => updateQty(it.id, (it.qty || 1) + 1)}
                    className="px-2 py-1 bg-black/40 rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              <button onClick={() => handleRemove(it.id)} className="text-sm text-white/80">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ------------------------------------------------
// CHECKOUT BUTTON
// ------------------------------------------------
function CheckoutButton({ total, clearCart, setOpen }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const { cart } = useCart();

  async function handlePay() {
    if (!user) return router.push("/login");

    const amount = Number(total) || 0;
    if (amount <= 0) return alert("Cart total must be greater than 0");

    setLoading(true);
    try {
      const resp = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await resp.json();
      if (!data?.orderId) throw new Error("Order not created");

      // load Razorpay script
      await new Promise((res, rej) => {
        if (window.Razorpay) return res(true);
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => res(true);
        s.onerror = () => rej("Razorpay load failed");
        document.head.appendChild(s);
      });

      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "IGNITIA",
        order_id: data.orderId,

        handler: async function (response) {
          try {
            // Obtain a fresh Firebase ID token for the current user
            const idToken = auth.currentUser ? await auth.currentUser.getIdToken(true) : null;

            // Build order payload
            const orderPayload = {
              // If cart has multiple items, record a combined name; prefer the first item's id for itemId
              itemId: (cart && cart[0] && cart[0].id) || null,
              itemName: cart && cart.length === 1 ? cart[0].title : (cart || []).map(i => i.title).join(', '),
              amountPaid: amount,
              transactionId: response.razorpay_payment_id,
              paymentStatus: 'success',
            };

            const verifyResp = await fetch('/api/razorpay-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken, paymentData: response, order: orderPayload })
            });

            const vdata = await verifyResp.json();
            if (verifyResp.ok) {
              clearCart();
              router.push('/payment-success');
            } else {
              console.error('Payment verification failed', vdata);
              router.push('/payment-failed');
            }
          } catch (err) {
            console.error('Payment handler error', err);
            router.push('/payment-failed');
          }
        },
      });

      rzp.open();
      setOpen(false);

    } catch (err) {
      console.error("Payment error:", err);
      alert(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading || !(Number(total) > 0)}
      id="checkout-proceed"
      className={`w-full py-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-semibold ${
        loading ? "opacity-70 cursor-wait" : "hover:scale-[1.02] transition-transform"
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
          Preparing payment...
        </span>
      ) : (
        "Proceed to Pay"
      )}
    </button>
  );
}
