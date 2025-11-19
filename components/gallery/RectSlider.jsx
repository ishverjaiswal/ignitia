import React, { useEffect, useRef, useState } from 'react'

// Rectangle slider: 3-image center layout, autoplay, manual nav
export default function RectSlider({ images = [], onOpen }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const mounted = useRef(false)
  const autoplayRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      if (autoplayRef.current) clearInterval(autoplayRef.current)
    }
  }, [])

  useEffect(() => {
    // autoplay every 3000ms
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    if (!paused && images.length > 1) {
      autoplayRef.current = setInterval(() => {
        setIndex(i => (i + 1) % images.length)
      }, 3000)
    }
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current) }
  }, [paused, images])

  // helper to get circular index
  const idx = (i) => ((i % images.length) + images.length) % images.length

  // GSAP entry animation (loaded at runtime)
  useEffect(() => {
    let gsap
    let ctx
    async function loadAndAnimate() {
      try {
        if (typeof window === 'undefined') return
        if (!window.gsap) {
          await new Promise((res, rej) => {
            const s = document.createElement('script')
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
            s.onload = res
            s.onerror = rej
            document.head.appendChild(s)
          })
        }
        gsap = window.gsap
        ctx = gsap.context(() => {
          gsap.from(containerRef.current.querySelectorAll('.card'), {
            opacity: 0, y: 18, stagger: 0.08, duration: 0.8, ease: 'power3.out'
          })
        }, containerRef)
      } catch (e) {
        // ignore animation errors
        console.warn('GSAP failed to load for RectSlider', e)
      }
    }
    loadAndAnimate()
    return () => { if (ctx && ctx.revert) ctx.revert() }
  }, [])

  function prev() { setIndex(i => idx(i - 1)) }
  function next() { setIndex(i => idx(i + 1)) }

  return (
    <section className="w-full max-w-6xl mx-auto py-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gold text-2xl font-semibold">Featured</h3>
        <div className="flex gap-3">
          <button aria-label="prev" onClick={prev} className="w-10 h-10 rounded-full border-2 border-gold text-gold flex items-center justify-center">◀</button>
          <button aria-label="next" onClick={next} className="w-10 h-10 rounded-full border-2 border-gold text-gold flex items-center justify-center">▶</button>
        </div>
      </div>

      <div ref={containerRef} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="relative overflow-hidden">
        <div className="flex items-stretch justify-center gap-6">
          {images.length === 0 && <div className="text-white">No images</div>}
          {images.length > 0 && [ -1, 0, 1 ].map((offset) => {
            const i = idx(index + offset)
            const isCenter = offset === 0
            return (
              <button key={`${i}-${offset}`} onClick={() => onOpen(i)} className={`card transform transition-transform duration-500 ${isCenter ? 'scale-105 z-20' : 'scale-95 z-10'} bg-black rounded-xl overflow-hidden`} style={{width: isCenter ? 520 : 380, boxShadow: '0 10px 30px rgba(0,0,0,0.6)'}}>
                <div className="relative w-full h-64 bg-gray-900">
                  <img src={images[i]} alt={`gallery-${i}`} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 pointer-events-none" style={{boxShadow: isCenter ? '0 0 40px rgba(255,200,60,0.18)' : 'none', border: '4px solid rgba(212,175,55,0.98)', borderRadius: 12}} />
                  <div className="absolute left-4 bottom-4 text-sm text-white/90">Click to view full image</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
