import React, { useEffect, useRef } from 'react'

// ChakraHero
// - Canvas-driven golden particle field + pulsing halo
// - Overlay silhouette image (place your provided image at `public/meditation.png`)
// - Animated chakra orbs positioned vertically on the silhouette
// Usage: place in a container sized to the hero card (e.g. absolute inset-0)

export default function ChakraHero({ className = '' }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w = canvas.width = wrapRef.current.clientWidth
    let h = canvas.height = wrapRef.current.clientHeight
    let particles = []
    const particleCount = Math.floor(Math.max(60, (w * h) / 16000))
    let mounted = true

    function resize() {
      w = canvas.width = wrapRef.current.clientWidth
      h = canvas.height = wrapRef.current.clientHeight
    }

    function initParticles() {
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.2,
          vy: -0.1 - Math.random() * 0.6,
          size: 0.6 + Math.random() * 2.4,
          life: 30 + Math.random() * 120,
          alpha: 0.1 + Math.random() * 0.9
        })
      }
    }

    initParticles()

    let last = performance.now()

    function draw(t) {
      if (!mounted) return
      const now = performance.now()
      const dt = Math.min(40, now - last)
      last = now

      // background subtle radial glow
      ctx.clearRect(0, 0, w, h)
      const grd = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.08, w / 2, h / 2, Math.max(w, h) * 0.7)
      grd.addColorStop(0, 'rgba(255, 236, 150, 0.18)')
      grd.addColorStop(0.4, 'rgba(212,175,55,0.07)')
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, w, h)

      // pulsing halo ring
      const pulse = 0.9 + Math.sin(t * 0.0022) * 0.08
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.beginPath()
      ctx.lineWidth = Math.max(6, Math.min(40, (Math.min(w, h) * 0.02) * pulse))
      ctx.strokeStyle = 'rgba(255,230,140,0.28)'
      const r = Math.min(w, h) * 0.37
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      // particles (gold sparks)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx * dt * 0.6
        p.y += p.vy * dt * 0.6
        p.life -= dt * 0.12
        p.alpha *= 0.999
        if (p.y < -20 || p.life <= 0) {
          p.x = Math.random() * w
          p.y = h + 10 + Math.random() * 40
          p.vx = (Math.random() - 0.5) * 0.3
          p.vy = -0.2 - Math.random() * 0.7
          p.size = 0.6 + Math.random() * 2.4
          p.life = 30 + Math.random() * 160
          p.alpha = 0.1 + Math.random() * 0.9
        }

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        g.addColorStop(0, 'rgba(255,244,180,' + (p.alpha * 1.0) + ')')
        g.addColorStop(0.3, 'rgba(255,200,80,' + (p.alpha * 0.55) + ')')
        g.addColorStop(1, 'rgba(200,120,30,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (1 + Math.sin(t * 0.002 + i) * 0.15), 0, Math.PI * 2)
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

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

  // chakra positions in percent relative to container center (approximate)
  const chakras = [
    { color: '#D16BFF', y: 30 }, // crown
    { color: '#9AE0FF', y: 44 }, // throat
    { color: '#7EF57E', y: 58 }, // heart
    { color: '#FFD36B', y: 70 }, // solar
    { color: '#FF9A5C', y: 80 }, // sacral
    { color: '#FF6B6B', y: 90 }  // root
  ]

  return (
    <div ref={wrapRef} className={'chakra-hero relative w-full h-full overflow-hidden ' + className}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* silhouette image must be placed at /public/meditation.png */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img src="/meditation.png" alt="meditation" className="chakra-silhouette max-w-[76%] h-auto drop-shadow-[0_30px_80px_rgba(0,0,0,0.85)]" />
      </div>

      {/* chakra orbs (positioned absolutely) */}
      <div className="absolute inset-0 pointer-events-none">
        {chakras.map((c, i) => (
          <div
            key={i}
            className="chakra-orb"
            style={{
              left: '50%',
              top: `${c.y}%`,
              transform: 'translate(-50%, -50%)',
              background: c.color,
              boxShadow: `0 0 ${8 + i * 6}px ${c.color}33, 0 0 ${20 + i * 6}px ${c.color}22`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        .chakra-hero { background: transparent }
        canvas { display: block }
        .chakra-silhouette { mix-blend-mode: multiply; filter: saturate(0%) contrast(0.02) drop-shadow(0 12px 40px rgba(0,0,0,0.8)); }
        .chakra-orb {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          transform-origin: center;
          animation: orbPulse 2.6s ease-in-out infinite;
        }
        .chakra-orb:nth-child(1) { animation-duration: 3.2s }
        .chakra-orb:nth-child(2) { animation-duration: 2.8s }
        .chakra-orb:nth-child(3) { animation-duration: 2.4s }
        .chakra-orb:nth-child(4) { animation-duration: 2.6s }
        .chakra-orb:nth-child(5) { animation-duration: 2.9s }
        .chakra-orb:nth-child(6) { animation-duration: 3.1s }

        @keyframes orbPulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.85 }
          50% { transform: translate(-50%, -50%) scale(1.4); opacity: 1 }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.85 }
        }

        @media (max-width: 768px) {
          .chakra-silhouette { max-width: 92% }
          .chakra-orb { width: 12px; height: 12px }
        }
      `}</style>
    </div>
  )
}
