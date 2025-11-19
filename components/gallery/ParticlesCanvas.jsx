import React, { useEffect, useRef } from 'react'

// lightweight golden particles canvas
export default function ParticlesCanvas({ className='' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = canvas.width = canvas.clientWidth
    let h = canvas.height = canvas.clientHeight
    const particles = []
    const count = Math.max(10, Math.floor(w / 120))

    for (let i=0;i<count;i++) particles.push({
      x: Math.random()*w,
      y: Math.random()*h,
      r: 2 + Math.random()*4,
      vx: (Math.random()-0.5)*0.3,
      vy: (Math.random()-0.5)*0.3,
      alpha: 0.3 + Math.random()*0.7
    })

    let raf = null
    function render(){
      ctx.clearRect(0,0,w,h)
      for (let p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*8)
        g.addColorStop(0, `rgba(255,220,120,${p.alpha})`)
        g.addColorStop(1, 'rgba(255,220,120,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r*6, 0, Math.PI*2)
        ctx.fill()
      }
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    function onResize(){
      w = canvas.width = canvas.clientWidth
      h = canvas.height = canvas.clientHeight
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 ${className}`} />
}
