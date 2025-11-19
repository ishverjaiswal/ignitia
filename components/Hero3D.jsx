"use client"
import React, { useEffect, useRef } from 'react'

export default function Hero3D() {
  const rootRef = useRef(null)
  const titleRef = useRef(null)
  const ctaRef = useRef(null)
  const cardRef = useRef(null)
  const floatRefs = useRef([])
  const canvasRef = useRef(null)

  useEffect(() => {
    let raf = null
    let width = 0
    let height = 0
    const root = rootRef.current
    const card = cardRef.current
    const glow = root.querySelector('.cursor-glow')

    // GSAP entry animations (dynamic import to avoid SSR issues)
    ;(async () => {
      try {
        const gsapModule = await import('gsap')
        const gsap = gsapModule.gsap || gsapModule.default || gsapModule
        // initial entry
        gsap.set(root.querySelectorAll('.will-fade'), { autoAlpha: 0, y: 14 })
        gsap.from(titleRef.current, { autoAlpha: 0, y: 28, duration: 1.1, ease: 'power3.out' })
        gsap.from(ctaRef.current, { autoAlpha: 0, y: 22, duration: 0.9, delay: 0.18, ease: 'power3.out' })
        gsap.from(card, { autoAlpha: 0, y: 40, duration: 1.4, ease: 'power4.out', delay: 0.06 })

        // stagger floating UI bits
        gsap.from(floatRefs.current, { y: 8, autoAlpha: 0, duration: 1.2, stagger: 0.08, ease: 'sine.out', delay: 0.18 })
      } catch (e) {
        // fail silently if gsap not available
        console.warn('gsap not loaded', e)
      }
    })()

    // Tilt & parallax using requestAnimationFrame
    let mouseX = 0
    let mouseY = 0
    let tx = 0
    let ty = 0
    const damp = 0.08

    function onMove(e) {
      const rect = root.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      mouseX = x
      mouseY = y
      // move glow
      if (glow) {
        glow.style.setProperty('--gx', `${(x + 0.5) * 100}%`)
        glow.style.setProperty('--gy', `${(y + 0.5) * 100}%`)
      }
    }

    function onLeave() {
      mouseX = 0
      mouseY = 0
      if (glow) {
        glow.style.setProperty('--gx', `50%`)
        glow.style.setProperty('--gy', `50%`)
      }
    }

    function rafLoop() {
      tx += (mouseX - tx) * damp
      ty += (mouseY - ty) * damp

      const rotateY = tx * 14 // degrees
      const rotateX = -ty * 14

      if (card) card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`

      // parallax layers
      const bg = root.querySelector('.layer-bg')
      const mid = root.querySelector('.layer-mid')
      const fg = root.querySelector('.layer-fg')
      if (bg) bg.style.transform = `translate3d(${tx * 10}px, ${ty * 8}px, 0) scale(1.04)`
      if (mid) mid.style.transform = `translate3d(${tx * 18}px, ${ty * 12}px, 0) translateZ(20px)`
      if (fg) fg.style.transform = `translate3d(${tx * 28}px, ${ty * 18}px, 0) translateZ(40px)`

      raf = requestAnimationFrame(rafLoop)
    }

    root.addEventListener('mousemove', onMove)
    root.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(rafLoop)

    // Particle canvas setup
    const canvas = canvasRef.current
    let ctx = null
    let particles = []
    let pRaf = null

    function initCanvas() {
      if (!canvas) return
      ctx = canvas.getContext('2d')
      function resize() {
        width = canvas.width = root.offsetWidth
        height = canvas.height = root.offsetHeight
        particles = []
        const count = Math.max(16, Math.floor((width * height) / 42000))
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: 0.6 + Math.random() * 2.2,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            alpha: 0.08 + Math.random() * 0.18
          })
        }
      }
      resize()

      function draw() {
        if (!ctx) return
        ctx.clearRect(0, 0, width, height)
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          p.x += p.vx
          p.y += p.vy
          if (p.x < -10) p.x = width + 10
          if (p.x > width + 10) p.x = -10
          if (p.y < -10) p.y = height + 10
          if (p.y > height + 10) p.y = -10

          ctx.beginPath()
          ctx.fillStyle = `rgba(0,231,255,${p.alpha})`
          ctx.shadowColor = '#00E7FF'
          ctx.shadowBlur = 6
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
        }
        pRaf = requestAnimationFrame(draw)
      }
      draw()
      window.addEventListener('resize', resize)
      return () => window.removeEventListener('resize', resize)
    }

    const cleanupCanvas = initCanvas()

    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(pRaf)
      root.removeEventListener('mousemove', onMove)
      root.removeEventListener('mouseleave', onLeave)
      try { cleanupCanvas && cleanupCanvas() } catch (e) {}
    }
  }, [])

  // collect float refs
  function setFloat(el, i) {
    if (!el) return
    floatRefs.current[i] = el
  }

  return (
    <section ref={rootRef} className="relative isolate overflow-hidden py-20 px-6 sm:py-28">
      {/* Cinematic gradient background */}
      <div className="absolute inset-0 -z-10 layer-bg" aria-hidden
        style={{
          background: 'radial-gradient(1200px 600px at 10% 10%, rgba(138,85,255,0.10), transparent 6%), linear-gradient(180deg,#05050a 0%, #0a0a0f 45%, #060610 100%)',
          boxShadow: 'inset 0 120px 260px rgba(10,10,15,0.6)'
        }} />

      {/* subtle purple glow mid-layer */}
      <div className="absolute inset-0 -z-9 layer-mid pointer-events-none" aria-hidden
        style={{
          background: 'linear-gradient(90deg, rgba(16,6,36,0.06), rgba(10,10,15,0) 40%, rgba(0,231,255,0.03))'
        }} />

      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 -z-5" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h2 ref={titleRef} className="will-fade font-display text-4xl sm:text-5xl md:text-6xl leading-tight text-white drop-shadow-xl" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Visionary Interfaces,
            <br />
            Crafted for Tomorrow
          </h2>

          <p className="mt-6 text-lg sm:text-xl text-gray-200 max-w-xl will-fade" style={{ color: 'rgba(240,213,155,0.9)' }}>
            A premium 3D hero with glassmorphism, neon glows, and cinematic motion. Apple Vision Pro vibes meet cyberpunk elegance.
          </p>

          <div className="mt-8 flex justify-center lg:justify-start gap-4">
            <a ref={ctaRef} className="will-fade inline-flex items-center gap-3 bg-gradient-to-r from-[#00E7FF]/12 to-[#F0D59B]/10 hover:from-[#00E7FF]/18 hover:to-[#F0D59B]/14 text-white px-5 py-3 rounded-full backdrop-blur-md border border-[rgba(255,255,255,0.06)] shadow-lg" href="#" style={{ boxShadow: '0 12px 40px rgba(2,6,23,0.6), 0 0 40px rgba(0,231,255,0.03)' }}>
              <span className="w-2 h-2 rounded-full bg-[#00E7FF] shadow-[0_0_12px_rgba(0,231,255,0.18)]" />
              Explore Demo
            </a>
            <a className="will-fade inline-flex items-center gap-2 text-sm text-[#F0D59B] px-4 py-3 rounded-full border border-[rgba(240,213,155,0.06)]" href="#">
              Live Preview
            </a>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <div ref={cardRef} className="relative will-fade w-[360px] sm:w-[420px] md:w-[520px] h-[320px] md:h-[380px] rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] backdrop-blur-md shadow-2xl" style={{ transformStyle: 'preserve-3d', transition: 'transform 220ms cubic-bezier(.12,.9,.22,.98)' }}>

            {/* holographic foreground UI */}
            <div ref={(el)=>setFloat(el,0)} className="absolute top-6 left-6 layer-fg w-24 h-24 rounded-lg bg-gradient-to-tr from-[#00E7FF]/20 to-[#8A55FF]/12 border border-[rgba(255,255,255,0.04)] shadow-[0_8px_30px_rgba(10,8,20,0.6)] p-3">
              <div className="w-full h-full rounded-md bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] backdrop-blur-sm" />
            </div>

            <div ref={(el)=>setFloat(el,1)} className="absolute right-6 top-8 layer-mid w-36 h-20 rounded-xl bg-[rgba(10,8,20,0.34)] border border-[rgba(255,255,255,0.03)] p-3 flex flex-col justify-center">
              <div className="text-xs text-[#00E7FF] font-medium">Holo Panel</div>
              <div className="text-sm text-gray-100">Status: <span style={{ color: '#F0D59B' }}>Active</span></div>
            </div>

            <div ref={(el)=>setFloat(el,2)} className="absolute bottom-6 left-10 layer-mid w-28 h-14 rounded-lg bg-gradient-to-br from-[#8a55ff]/12 to-[#00e7ff]/6 border border-[rgba(255,255,255,0.02)] p-2 flex items-center justify-center text-xs text-white">HUD</div>

            {/* center hologram */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[68%] h-[62%] rounded-xl" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 rounded-xl" style={{ background: 'radial-gradient(60% 40% at 50% 30%, rgba(0,231,255,0.12), rgba(138,85,255,0.06) 30%, rgba(0,0,0,0.00) 65%)', boxShadow: 'inset 0 -24px 120px rgba(5,6,10,0.6)' }} />
                <div className="absolute inset-6 rounded-lg border border-[rgba(255,255,255,0.04)]" style={{ backdropFilter: 'blur(6px)' }}>
                  <div className="w-full h-full flex items-center justify-center text-white text-xl font-semibold" style={{ textShadow: '0 10px 40px rgba(2,6,23,0.7)' }}>
                    <div className="flex flex-col items-center gap-1">
                      <div style={{ color: '#00E7FF', fontSize: '20px', fontWeight: 700 }}>H O L O</div>
                      <div style={{ color: 'rgba(240,213,155,0.95)', fontSize: '12px' }}>Realtime Reactive UI</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* cursor-follow glow */}
            <div className="cursor-glow pointer-events-none absolute inset-0 rounded-2xl" style={{
              background: 'radial-gradient(140px circle at var(--gx,50%) var(--gy,50%), rgba(0,231,255,0.08), rgba(138,85,255,0.04) 30%, transparent 45%)',
              transition: 'background 160ms linear'
            }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .font-display { font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial }
        .layer-bg { will-change: transform }
        .layer-mid { will-change: transform }
        .layer-fg { will-change: transform }
        canvas { width: 100%; height: 100%; }
        @media (max-width: 768px) {
          .will-fade { transition-duration: 420ms }
        }
      `}</style>
    </section>
  )
}
