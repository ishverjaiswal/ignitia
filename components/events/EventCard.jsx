import React, { useEffect, useRef } from 'react'
import { useCart } from '../../context/CartContext'

// EventCard: premium event card with GSAP reveal and hover lift
export default function EventCard({ event, onAdd, autoCheckout = false }) {
  const ref = useRef(null)
  const { addToCart, setOpen } = useCart()

  useEffect(() => {
    let ctx
    async function load() {
      try {
        if (typeof window === 'undefined') return
        if (!window.gsap) {
          await new Promise((res, rej) => {
            const s = document.createElement('script')
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
            s.onload = res; s.onerror = rej; document.head.appendChild(s)
          })
        }
        const gsap = window.gsap
        ctx = gsap.context(() => {
          gsap.from(ref.current, { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out' })
        }, ref)
      } catch (e) {
        // ignore
      }
    }
    load()
    return () => { if (ctx && ctx.revert) ctx.revert() }
  }, [])

  return (
    <article ref={ref} className="bg-gradient-to-br from-[#0b0210] to-[#120018] rounded-2xl border-2 border-gold/80 shadow-xl overflow-hidden transform transition-transform hover:scale-[1.02] hover:shadow-2xl" style={{borderColor: 'rgba(212,175,55,0.95)'}}>
      <div className="w-full h-56 md:h-72 bg-black/10">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
      </div>

      <div className="p-6">
        <h3 className="text-gold text-2xl font-display mb-2">{event.title}</h3>
        <div className="flex items-center gap-4 text-sm text-white/80 mb-3">
          <div className="flex items-center gap-2"><svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 7V3M16 7V3M3 11h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span>{event.date}</span></div>
          <div className="flex items-center gap-2"><svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 6-9 11-9 11S3 16 3 10a9 9 0 0118 0z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span>{event.venue}</span></div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-white/80 mb-4">
          <div className="flex items-center gap-2"><svg className="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 8v4l3 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span>{event.time}</span></div>
          <div className="text-sm">Coordinator: <strong className="text-white">{event.coordinator}</strong></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-gold font-semibold text-xl">₹{event.price}</div>
          <button onClick={() => {
            const item = { id: event.id, title: event.title, price: event.price, image: event.image }
            // add to cart via context
            addToCart && addToCart(item)
            // open cart drawer so user can proceed to checkout
            setOpen && setOpen(true)
            // optional: if EventCard is used with autoCheckout prop, trigger the checkout button
            try {
              if (autoCheckout) {
                // wait for drawer to render
                setTimeout(() => {
                  const btn = document.getElementById('checkout-proceed')
                  if (btn) btn.click()
                }, 700)
              }
            } catch (e) {}
            // optional callback
            if (onAdd) onAdd(item)
          }} className="inline-flex items-center gap-2 px-4  py-2 bg-gradient-to-r from-yellow-400 to-yellow-300 text-black rounded-full shadow-md hover:shadow-lg transform transition-all" aria-label={`Add ${event.title} to cart`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  )
}
