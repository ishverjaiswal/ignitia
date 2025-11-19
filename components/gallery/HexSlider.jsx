import React, { useEffect, useRef, useState } from 'react'

// Hexagon slider: shows a row of hex-masked images with glowing edges
export default function HexSlider({ images = [], onOpen }) {
  const [index, setIndex] = useState(0)
  const mounted = useRef(false)
  const containerRef = useRef(null)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  // simple nav
  const prev = () => setIndex(i => (i - 1 + images.length) % images.length)
  const next = () => setIndex(i => (i + 1) % images.length)

  useEffect(() => {
    // entry animation via GSAP (CDN loaded at runtime)
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
        gsap.from(containerRef.current.querySelectorAll('.hex'), { y: 20, opacity: 0, stagger: 0.06, duration: 0.8, ease: 'power2.out' })
      } catch (e) { console.warn('gsap load failed hexslider', e) }
    }
    run()
  }, [])

  const idx = (i) => ((i % images.length) + images.length) % images.length

  return (
    <section className="w-full max-w-6xl mx-auto py-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gold text-2xl font-semibold">Hex Showcase</h3>
        <div className="flex gap-3">
          <button onClick={prev} className="w-10 h-10 rounded-full border-2 border-gold text-gold flex items-center justify-center">◀</button>
          <button onClick={next} className="w-10 h-10 rounded-full border-2 border-gold text-gold flex items-center justify-center">▶</button>
        </div>
      </div>

      <div ref={containerRef} className="flex items-center justify-center gap-6 overflow-visible">
        {images.length === 0 && <div className="text-white">No images</div>}
        {images.map((src, i) => {
          const distance = Math.abs(i - index)
          const scale = distance === 0 ? 1.05 : distance === 1 ? 0.95 : 0.85
          return (
            <button key={i} onClick={() => onOpen(i)} className={`hex transform transition-all duration-500`} style={{transform: `scale(${scale})`, filter: distance <= 1 ? 'drop-shadow(0 12px 30px rgba(0,0,0,0.6))' : '', borderRadius: 12}}>
              <svg viewBox="0 0 100 100" className="w-64 h-64 block">
                <defs>
                  <clipPath id={`hex-clip-${i}`}> 
                    <polygon points="50 2, 92 25, 92 75, 50 98, 8 75, 8 25" />
                  </clipPath>
                </defs>
                <image clipPath={`url(#hex-clip-${i})`} href={src} preserveAspectRatio="xMidYMid slice" width="100" height="100" />
                <polygon points="50 2, 92 25, 92 75, 50 98, 8 75, 8 25" fill="none" stroke="rgba(212,175,55,0.95)" strokeWidth="4" filter="url(#glow)" />
              </svg>
            </button>
          )
        })}
      </div>
    </section>
  )
}
