import React, { useEffect, useRef, useState } from 'react'

// Spotlight slider: large focus center with 3-image layout and subtle parallax
export default function SpotlightSlider({ images = [], onOpen }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const containerRef = useRef(null)
  const autoplayRef = useRef(null)

  useEffect(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    autoplayRef.current = setInterval(() => {
      if (!paused && images.length > 1) setIndex(i => (i + 1) % images.length)
    }, 3500)
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current) }
  }, [paused, images])

  useEffect(() => {
    // subtle slide-in on mount
    async function run() {
      try {
        if (!window.gsap) {
          await new Promise((res, rej) => {
            const s = document.createElement('script')
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
            s.onload = res; s.onerror = rej; document.head.appendChild(s)
          })
        }
        const gsap = window.gsap
        gsap.from(containerRef.current.querySelectorAll('.spot-card'), { opacity: 0, y: 24, stagger: 0.06, duration: 0.8, ease: 'power3.out' })
      } catch (e) { }
    }
    run()
  }, [])

  const idx = (i) => ((i % images.length) + images.length) % images.length

  const prev = () => setIndex(i => idx(i - 1))
  const next = () => setIndex(i => idx(i + 1))

  return (
    <section className="w-full max-w-6xl mx-auto py-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gold text-2xl font-semibold">Spotlight</h3>
        <div className="flex gap-3">
          <button onClick={prev} className="w-10 h-10 rounded-full border-2 border-gold text-gold flex items-center justify-center">◀</button>
          <button onClick={next} className="w-10 h-10 rounded-full border-2 border-gold text-gold flex items-center justify-center">▶</button>
        </div>
      </div>

      <div ref={containerRef} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="relative overflow-hidden">
        <div className="flex items-stretch justify-center gap-6">
          {[ -1, 0, 1 ].map(offset => {
            const i = idx(index + offset)
            const isCenter = offset === 0
            return (
              <div key={i} className={`spot-card transition-transform duration-600 ${isCenter ? 'scale-105 z-20' : 'scale-95 z-10'}`} style={{width: isCenter ? 760 : 480}}>
                <button onClick={() => onOpen(i)} className="w-full h-full block rounded-2xl overflow-hidden relative">
                  <img src={images[i]} alt={`spot-${i}`} loading="lazy" className="w-full h-96 object-cover transform transition-transform duration-500 hover:scale-105" />
                  <div className="absolute inset-0 pointer-events-none" style={{boxShadow: isCenter ? '0 40px 120px rgba(0,0,0,0.6)' : '', border: '6px solid rgba(212,175,55,0.95)', borderRadius: 18}} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
