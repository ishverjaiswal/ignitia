import Link from 'next/link'
import React, { useRef, useEffect } from 'react'

export default function Footer() {
  const logoRef = useRef(null)
  const canvasRef = useRef(null)
  let ctx
  let w, h, particles = []

  // ⭐ 3D Logo Hover Effect
  useEffect(() => {
    const el = logoRef.current
    if (!el) return

    function onMove(e) {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const rotY = (x - 0.5) * 18
      const rotX = (y - 0.5) * -12
      el.style.transform = `perspective(900px) translateZ(12px) rotateX(${rotX}deg) rotateY(${rotY}deg)`
    }

    function onLeave() {
      el.style.transform =
        'perspective(900px) translateZ(0) rotateX(0) rotateY(0)'
      el.style.transition = 'transform 400ms ease'
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  // ⭐ FULL FOOTER BACKGROUND ANIMATION (particles, sparks, waves, grid)
  useEffect(() => {
    const canvas = canvasRef.current
    ctx = canvas.getContext('2d')

    function resize() {
      w = canvas.width = window.innerWidth
      h = canvas.height = 380
    }
    resize()
    window.addEventListener('resize', resize)

    // Create particles
    for (let i = 0; i < 160; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.5,
        speedX: Math.random() * 0.6 - 0.3,
        speedY: Math.random() * 0.6 - 0.3,
        glow: Math.random() * 0.4 + 0.4
      })
    }

    function animate() {
      ctx.clearRect(0, 0, w, h)

      // ⭐ Dark matrix-style grid
      ctx.strokeStyle = 'rgba(255, 215, 130, 0.05)'
      ctx.lineWidth = 0.2
      for (let gx = 0; gx < w; gx += 80) {
        ctx.beginPath()
        ctx.moveTo(gx, 0)
        ctx.lineTo(gx, h)
        ctx.stroke()
      }

      for (let gy = 0; gy < h; gy += 80) {
        ctx.beginPath()
        ctx.moveTo(0, gy)
        ctx.lineTo(w, gy)
        ctx.stroke()
      }

      // ⭐ Floating golden sparks
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 215, 130, ${p.glow})`
        ctx.shadowBlur = 12
        ctx.shadowColor = '#FFD782'
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        p.x += p.speedX
        p.y += p.speedY

        if (p.x > w) p.x = 0
        if (p.x < 0) p.x = w
        if (p.y > h) p.y = 0
        if (p.y < 0) p.y = h
      })

      // ⭐ 3D wave distortion
      let grd = ctx.createRadialGradient(
        w / 2,
        h / 1.3,
        20,
        w / 2,
        h / 1.2,
        260
      )
      grd.addColorStop(0, 'rgba(212,175,55,0.10)')
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, w, h)

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
    <footer className="relative site-footer">
      {/* ⭐ FULL BACKGROUND CANVAS */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>

      {/* CONTENT ABOVE CANVAS */}
      <div className="relative container">
        <div className="grid">
          {/* BRAND / LOGO */}
          <div className="col brand">
            <Link href="/profile" aria-label="Open profile">
              <div className="logo flex items-center" ref={logoRef}>
                
                <svg
                  width="120"
                  height="48"
                  viewBox="0 0 170 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="goldGrad" x1="0" x2="1">
                      <stop offset="0%" stopColor="#F5D88A" />
                      <stop offset="60%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#B88A18" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M20 45C28 34 42 20 42 12C42 7 37 4 30 4C24 4 16 10 16 19C16 28 8 37 8 48H20Z"
                    fill="url(#goldGrad)"
                  />

                  <text
                    x="60"
                    y="40"
                    fill="url(#goldGrad)"
                    fontFamily="Playfair Display, serif"
                    fontWeight="800"
                    fontSize="32"
                  >
                    Ignitia
                  </text>
                </svg>
              </div>
            </Link>
            <p className="tagline">
              Join us for an unforgettable celebration of art, music, and culture.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div className="col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/teams">Teams</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* EXPLORE */}
          <div className="col">
            <h4>Explore</h4>
            <ul>
              <li><Link href="/events">Events</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/sponsors">Sponsors</Link></li>
              <li><Link href="/home">Archives</Link></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div className="col">
            <h4>Support</h4>
            <ul>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/refund">Refund Policy</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
              <li><Link href="/delivery">Delivery & Shipping</Link></li>
              <li><Link href="/faqs">FAQs</Link></li>
            </ul>
          </div>
        </div>

        <div className="copyright">
          © 2025 Ignitia 2K25 by PSIT. All rights reserved.
        </div>
      </div>

      {/* 🎨 CSS */}
      <style jsx>{`
        .site-footer {
          background: #000;
          color: #fff;
          padding: 48px 0 28px;
          overflow: hidden;
          border-top: 1px solid rgba(212, 175, 55, 0.06);
        }
        canvas {
          pointer-events: none;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
        }
        .logo {
          width: fit-content;
          cursor: pointer;
          transition: 0.3s ease;
        }
        .col h4 {
          color: #D4AF37;
          margin-bottom: 12px;
          font-size: 1.15rem;
          font-family: 'Playfair Display', serif;
        }
        .col ul li {
          margin: 10px 0;
        }
        .col ul li a {
          color: white;
          opacity: 0.88;
          transition: 0.2s;
        }
        .col ul li a:hover {
          color: #F0D59B;
          opacity: 1;
        }
        .tagline {
          opacity: 0.9;
          margin-top: 12px;
          max-width: 320px;
        }
        .copyright {
          border-top: 1px solid rgba(212, 175, 55, 0.05);
          margin-top: 22px;
          padding-top: 18px;
          opacity: 0.85;
        }
        @media (min-width: 768px) {
          .grid {
            grid-template-columns: 2fr 1fr 1fr 1fr;
          }
        }
        .logo-mark {
          width: 48px;
          height: 48px;
          margin-right: 10px;
          border-radius: 6px;
          object-fit: contain;
          box-shadow: 0 6px 18px rgba(0,0,0,0.45);
        }
      `}</style>
    </footer>
  )
}
