import React, { useEffect, useState } from 'react'

export default function CartWidget({ cart, onRemove, onCheckout }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // nothing special here; could add animations
  }, [open])

  const total = cart.reduce((s, it) => s + Number(it.price || 0), 0)

  return (
    <div className="fixed top-6 right-6 z-50">
      <button onClick={() => setOpen(v => !v)} className="relative bg-transparent p-2 rounded-full border-2 border-gold text-gold w-12 h-12 flex items-center justify-center shadow-lg">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-gold text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{cart.length}</span>}
      </button>

      {open && (
        <div className="mt-3 w-80 bg-[#08020a] rounded-xl border border-gold p-4 shadow-2xl">
          <h4 className="text-gold font-semibold mb-3">Cart</h4>
          <div className="space-y-3 max-h-56 overflow-auto mb-3">
            {cart.length === 0 && <div className="text-white/70">No items in cart</div>}
            {cart.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between text-white/90">
                <div>
                  <div className="font-medium">{it.title}</div>
                  <div className="text-sm text-white/60">₹{it.price}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => onRemove(it.id)} className="text-sm text-white/80">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-white/90 mb-3">
            <div>Total</div>
            <div className="text-gold font-semibold">₹{total}</div>
          </div>
          <button onClick={() => onCheckout()} className="w-full py-2 bg-gradient-to-r from-yellow-400 to-yellow-300 text-black rounded-full">Proceed to Checkout</button>
        </div>
      )}
    </div>
  )
}
