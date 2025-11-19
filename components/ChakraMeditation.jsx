import React, { useEffect, useRef } from 'react'

export default function ChakraMeditation({ className = '' }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = (canvas.width = wrapRef.current.clientWidth)
    let h = (canvas.height = wrapRef.current.clientHeight)
    let particles = []
    const baseCount = Math.max(80, Math.floor((w * h) / 12000))
    let mounted = true

    function resize() {
      w = canvas.width = wrapRef.current.clientWidth
      h = canvas.height = wrapRef.current.clientHeight
    }

    function initParticles() {
      particles = []
      for (let i = 0; i < baseCount; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.6 + Math.random() * 2.6,
          vx: (Math.random() - 0.5) * 0.2,
          vy: -0.1 - Math.random() * 0.6,
          a: 0.5 + Math.random() * 0.8,
          life: 60 + Math.random() * 300
        })
      }
    }

    initParticles()

    let last = performance.now()
    function step(t) {
      if (!mounted) return
      const now = performance.now()
      const dt = Math.min(40, now - last)
      last = now

      // clear + background subtle glow
      ctx.clearRect(0, 0, w, h)

      // faint golden ambient
      const grd = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.05, w / 2, h / 2, Math.max(w, h) * 0.9)
      grd.addColorStop(0, 'rgba(255,236,160,0.16)')
      grd.addColorStop(0.45, 'rgba(212,175,55,0.06)')
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, w, h)

      // soft energy waves
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(255,220,120,${0.02 + i * 0.02})`
        ctx.lineWidth = 2 + i
        const amp = 6 + i * 4
        const freq = 0.002 + i * 0.001
        ctx.moveTo(0, h * 0.25 + Math.sin(t * 0.001 * (i + 1)) * amp)
        for (let x = 0; x < w; x += 14) {
          const y = h * (0.25 + i * 0.18) + Math.sin((x * freq) + (t * 0.001 * (i + 1))) * amp
          ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      ctx.restore()

      // halo ring (pulsing golden aura)
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      const pulse = 1 + Math.sin(t * 0.0018) * 0.08
      const radius = Math.min(w, h) * 0.36 * pulse
      ctx.beginPath()
      ctx.lineWidth = Math.max(6, Math.min(40, radius * 0.06))
      ctx.strokeStyle = 'rgba(255,230,140,0.28)'
      ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      // draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx * dt * 0.6
        p.y += p.vy * dt * 0.6
        p.life -= dt * 0.12
        if (p.y < -40 || p.life <= 0) {
          p.x = w * 0.36 + Math.random() * w * 0.28
          p.y = h + Math.random() * 60
          p.vx = (Math.random() - 0.5) * 0.4
          p.vy = -0.2 - Math.random() * 0.7
          p.r = 0.6 + Math.random() * 2.6
          p.life = 60 + Math.random() * 300
          p.a = 0.5 + Math.random() * 0.8
        }

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6)
        g.addColorStop(0, `rgba(255,244,190,${p.a})`)
        g.addColorStop(0.2, `rgba(255,200,80,${p.a * 0.6})`)
        g.addColorStop(1, `rgba(200,110,20,0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * (1 + Math.sin(t * 0.002 + i) * 0.12), 0, Math.PI * 2)
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)

    function onResize() {
      resize()
      initParticles()
    }
    window.addEventListener('resize', onResize)

    return () => {
      mounted = false
      window.removeEventListener('resize', onResize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Chakra mandala generator (SVG) - uses layered strokes and rotations in CSS
  const chakraData = [
    { color: '#FF4C4C', y: 78 }, // root - red (placed lower)
    { color: '#FF8040', y: 72 }, // sacral - orange
    { color: '#FFD24A', y: 66 }, // solar - yellow
    { color: '#6EE19A', y: 58 }, // heart - green
    { color: '#5FC3FF', y: 50 }, // throat - blue
    { color: '#8B66FF', y: 42 }, // third-eye - indigo
    { color: '#D08BFF', y: 34 }  // crown - violet
  ]

  return (
    <div ref={wrapRef} className={"chakra-meditation relative w-full h-full overflow-hidden " + className}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* SVG overlay: aura + silhouette + chakras */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
        {/* golden aura radial */}
        <defs>
          <radialGradient id="aura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#ffeaa0" stopOpacity="0.45" />
            <stop offset="55%" stopColor="#d4af37" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g transform="translate(0,0)">
          <circle cx="500" cy="500" r="360" fill="url(#aura)" style={{mixBlendMode: 'screen'}} />

          {/* silhouette - clean vector lotus pose, simplified and filled black */}
          <g transform="translate(0,0) scale(1)">
            <path d="M330 640c0 0-48 12-54 28s-6 32 20 40 120 26 170 12 92-34 116-36 80-4 92-30 0-44-18-56-56-36-86-38-84 4-116 6-70 8-120 22-40 12-40 12z" fill="#000" opacity="0.98" />
            <path d="M500 160c-48 0-86 40-86 88 0 32 10 58 28 76 22 22 62 42 58 90-8 74-8 86-8 116s4 74 16 84 18 12 22 12 8-4 18-12 24-28 36-52 22-42 34-60 22-34 38-50c20-20 36-48 36-88 0-48-38-86-86-86-30 0-34 10-34 10s0-10-24-10z" fill="#000" />
          </g>

          {/* Chakras (mandalas) - each is an animated group */}
          {chakraData.map((c, idx) => (
            <g key={idx} transform={`translate(500,${c.y * 10})`} className={`mandala mandala-${idx}`}>
              <g className="mandala-rot1">
                <circle r="18" fill="none" stroke={c.color} strokeWidth="2.6" strokeOpacity="0.95" />
              </g>
              <g className="mandala-rot2">
                <path d="M-16 0 q16 -28 32 0 q-16 28 -32 0" fill="none" stroke={c.color} strokeWidth="1.6" strokeOpacity="0.85" />
              </g>
              <g className="mandala-rot3">
                <circle r="8" fill={c.color} fillOpacity="0.98" />
              </g>
            </g>
          ))}
        </g>
      </svg>

      <style jsx>{`
        .chakra-meditation { background: transparent }
        svg { display: block }

        /* mandala rotations and glow */
        .mandala { transform-origin: 500px 500px; }
        .mandala-rot1 { animation: rotA 9s linear infinite; transform-origin: 0px 0px; filter: drop-shadow(0 6px 18px rgba(212,175,55,0.12)); }
        .mandala-rot2 { animation: rotB 6.4s linear reverse infinite; transform-origin: 0px 0px; }
        .mandala-rot3 { animation: rotC 5.2s linear infinite; transform-origin: 0px 0px; filter: blur(0.6px) drop-shadow(0 8px 20px rgba(255,220,120,0.12)); }

        @keyframes rotA { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
        @keyframes rotB { 0% { transform: rotate(0deg) } 100% { transform: rotate(-360deg) } }
        @keyframes rotC { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }

        /* subtle scale + glow per mandala for energy */
        .mandala { filter: drop-shadow(0 8px 28px rgba(212,175,55,0.06)); }
        .mandala-rot3 circle { animation: pulse 2.6s ease-in-out infinite; }
        @keyframes pulse { 0% { transform: scale(0.86); opacity: 0.86 } 50% { transform: scale(1.18); opacity: 1 } 100% { transform: scale(0.86); opacity: 0.86 } }

        /* reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .mandala-rot1, .mandala-rot2, .mandala-rot3 { animation: none }
          .mandala-rot3 circle { animation: none }
        }
      `}</style>
    </div>
  )
}
