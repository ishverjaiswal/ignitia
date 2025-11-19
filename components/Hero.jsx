import React, { useEffect, useRef } from 'react'

// Premium Hero: lightweight canvas particles + SVG emblem + CSS animations
export default function Hero() {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = (canvas.width = canvas.clientWidth)
    let h = (canvas.height = canvas.clientHeight)

    const particles = []
    const PARTICLE_COUNT = Math.max(12, Math.floor(w * 0.02)) // scale with width but keep small

    function rand(min, max) { return Math.random() * (max - min) + min }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(0.6, 2.4),
        vx: rand(-0.15, 0.15),
        vy: rand(-0.05, 0.05),
        alpha: rand(0.06, 0.22)
      })
    }

    let last = performance.now()

    function resize() {
      w = canvas.width = canvas.clientWidth
      h = canvas.height = canvas.clientHeight
    }

    function draw(now) {
      const dt = Math.min(40, now - last)
      last = now
      ctx.clearRect(0, 0, w, h)

      // soft gradient background overlay to add depth (blend mode handled by CSS)
      for (let p of particles) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        ctx.beginPath()
        ctx.fillStyle = `rgba(212,175,55, ${p.alpha})`
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // pointer parallax effect for emblem
  useEffect(() => {
    const el = document.getElementById('ignitia-emblem')
    if (!el) return
    let lastX = 0
    let lastY = 0
    const handle = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const x = (e.clientX - cx) / rect.width
      const y = (e.clientY - cy) / rect.height
      lastX = x * 8
      lastY = y * 8
      el.style.transform = `translate3d(${lastX}px, ${lastY}px, 0) rotate(${lastX * 0.2}deg)`
    }
    window.addEventListener('mousemove', handle)
    window.addEventListener('touchmove', (e) => { if (e.touches[0]) handle(e.touches[0]) }, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handle)
    }
  }, [])

  return (
    <section className="w-full relative isolate select-none">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
          <canvas ref={canvasRef} className="w-full h-full mix-blend-screen opacity-60" style={{ filter: 'blur(8px)', transform: 'translateZ(0)' }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 lg:py-32 relative">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight" style={{ color: '#F5E7C3', textShadow: '0 6px 30px rgba(0,0,0,0.6)' }}>
              IGNITIA
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0">
              A cultural fusion of light, sound and code — an elegant celebration of creativity.
            </p>

            <div className="mt-8 flex justify-center lg:justify-start gap-4">
              <a href="/events" className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold shadow-xl transform-gpu hover:scale-[1.02] transition">Explore Events</a>
              <a href="/signup" className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-yellow-600 text-yellow-200 hover:bg-yellow-700/10 transition">Join IGNITIA</a>
            </div>
          </div>

          <div className="w-full lg:w-1/3 flex-shrink-0">
            <div id="ignitia-emblem" className="mx-auto w-56 h-56 rounded-2xl flex items-center justify-center" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(212,175,55,0.18), transparent 20%), linear-gradient(180deg, rgba(20,10,30,0.6), rgba(8,2,8,0.4))', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02), 0 20px 60px rgba(0,0,0,0.6)' }}>
              <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0%" stopColor="#FFE59A" />
                    <stop offset="100%" stopColor="#D4AF37" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="62" fill="url(#g1)" opacity="0.95" />
                <path d="M100 60 L120 100 L100 140 L80 100 Z" fill="#1f0b2a" opacity="0.9" />
                <circle cx="100" cy="100" r="38" fill="rgba(0,0,0,0.6)" />
                <text x="100" y="108" textAnchor="middle" fill="#EAD28A" fontFamily="Playfair Display, serif" fontSize="22">IGN</text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        section { --hero-height: 360px; }
        @media(min-width: 1024px) { section { --hero-height: 420px; } }
        section > .max-w-7xl { min-height: var(--hero-height); }
        #ignitia-emblem { transition: transform 450ms cubic-bezier(.2,.9,.2,1); will-change: transform; }
        /* subtle floating animation */
        @keyframes floaty { 0% { transform: translateY(0) } 50% { transform: translateY(-6px) } 100% { transform: translateY(0) } }
        #ignitia-emblem { animation: floaty 6s ease-in-out infinite; }
        /* respect reduced motion */
        @media (prefers-reduced-motion: reduce) { #ignitia-emblem { animation: none } canvas { display:none } }
      `}</style>
    </section>
  )
}
