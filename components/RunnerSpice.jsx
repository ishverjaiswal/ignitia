import React, { useEffect, useRef } from 'react'

export default function RunnerSpice({ className = '' }) {
  const wrapRef = useRef(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    function onMove(e) {
      const rect = el.getBoundingClientRect()
      const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX
      const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY
      const x = (clientX - rect.left) / rect.width
      const y = (clientY - rect.top) / rect.height
      el.style.setProperty('--gx', `${(x * 100).toFixed(2)}%`)
      el.style.setProperty('--gy', `${(y * 100).toFixed(2)}%`)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('touchmove', onMove)
    }
  }, [])

  // create a set of particle elements via map; CSS handles animation using --i
  const particles = new Array(20).fill(0).map((_, i) => (
    <span key={i} className="spice" style={{ ['--i']: i }} />
  ))

  return (
    <div ref={wrapRef} className={"runner-spice-wrap w-full h-full flex items-center justify-center " + className}>
      <div className="runner-stage">
        <div className="spice-particles">{particles}</div>

        <svg className="runner-svg" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <g transform="translate(20,10)">
            {/* ground */}
            <ellipse cx="90" cy="170" rx="60" ry="10" fill="rgba(0,0,0,0.45)" />

            {/* legs */}
            <g className="leg left-leg" transform="translate(40,95)">
              <rect x="-6" y="0" width="12" height="36" rx="4" fill="#0b0b0b" />
              <rect x="-10" y="34" width="20" height="10" rx="3" fill="#2b2b2b" />
            </g>
            <g className="leg right-leg" transform="translate(110,95)">
              <rect x="-6" y="0" width="12" height="36" rx="4" fill="#0b0b0b" />
              <rect x="-10" y="34" width="20" height="10" rx="3" fill="#2b2b2b" />
            </g>

            {/* torso */}
            <g className="torso" transform="translate(40,32)">
              <rect x="0" y="0" width="80" height="56" rx="10" fill="#0f0c0f" stroke="#3b2a00" strokeWidth="1" />
            </g>

            {/* arms: left holds bowl of spices */}
            <g className="arm left-arm" transform="translate(18,52)">
              <rect x="-8" y="-6" width="28" height="12" rx="6" fill="#0b0b0b" />

              {/* bowl */}
              <g transform="translate(10,4)">
                <ellipse cx="6" cy="8" rx="16" ry="8" fill="#5a2d00" />
                <ellipse cx="6" cy="4" rx="12" ry="5" fill="#ffcc66" />
                <circle cx="2" cy="2" r="2" fill="#d98b1a" />
                <circle cx="8" cy="3" r="2" fill="#e0a23c" />
                <circle cx="12" cy="2" r="2" fill="#d98b1a" />
              </g>
            </g>

            <g className="arm right-arm" transform="translate(110,48)">
              <rect x="0" y="-6" width="34" height="12" rx="6" fill="#0b0b0b" />
            </g>

            {/* head */}
            <g className="head" transform="translate(58,-6)">
              <circle cx="18" cy="18" r="14" fill="#f6e6c4" />
              <circle cx="14" cy="16" r="2" fill="#0b0b0b" />
              <circle cx="22" cy="16" r="2" fill="#0b0b0b" />
            </g>
          </g>
        </svg>
      </div>

      <style jsx>{`
        .runner-spice-wrap { position: relative; }
        .runner-stage { width: 100%; height: 100%; display:flex; align-items:center; justify-content:center }
        .runner-svg { width: 72%; height: auto; max-width: 460px; overflow: visible }

        .spice-particles { position: absolute; left: 28%; top: 52%; width: 160px; height: 120px; pointer-events: none; transform: translate(-8px,-10px) }
        .spice { position: absolute; left: 50%; top: 50%; width: 6px; height: 6px; border-radius: 50%; background: #d98b1a; opacity: 0; transform-origin: center; }

        /* animate particles outward with stagger based on --i */
        .spice { animation: spiceMove 1.8s cubic-bezier(.2,.8,.2,1) infinite; }
        .spice:nth-child(even) { background: #e0a23c }
        .spice:nth-child(odd) { background: #d98b1a }
        .spice { left: calc(50% + (var(--i) - 10) * 2px); top: calc(50% + (var(--i) - 10) * -1px); animation-delay: calc(var(--i) * -0.08s); }

        @keyframes spiceMove {
          0% { transform: translate(0,0) scale(0.6); opacity: 0.0 }
          8% { opacity: 1; }
          60% { transform: translate(calc((var(--i) - 10) * 4px), calc(-40px - (var(--i) * 1.5px))) scale(1); opacity: 0.95 }
          100% { transform: translate(calc((var(--i) - 10) * 8px), -140px) scale(0.6); opacity: 0 }
        }

        /* simple running leg animation */
        .left-leg, .right-leg { transform-origin: 0 0; }
        .left-leg { animation: legLeft 0.64s linear infinite; }
        .right-leg { animation: legRight 0.64s linear infinite; }
        @keyframes legLeft { 0% { transform: translate(40px,95px) rotate(10deg);} 50% { transform: translate(40px,95px) rotate(-28deg);} 100% { transform: translate(40px,95px) rotate(10deg);} }
        @keyframes legRight { 0% { transform: translate(110px,95px) rotate(-28deg);} 50% { transform: translate(110px,95px) rotate(10deg);} 100% { transform: translate(110px,95px) rotate(-28deg);} }

        /* arms swing, left slightly steadies to hold bowl */
        .left-arm { animation: armLeft 0.64s linear infinite; transform-origin: 22px 6px; }
        .right-arm { animation: armRight 0.64s linear infinite; transform-origin: 8px 6px; }
        @keyframes armLeft { 0% { transform: translate(18px,52px) rotate(-8deg);} 50% { transform: translate(18px,52px) rotate(6deg);} 100% { transform: translate(18px,52px) rotate(-8deg);} }
        @keyframes armRight { 0% { transform: translate(110px,48px) rotate(22deg);} 50% { transform: translate(110px,48px) rotate(-8deg);} 100% { transform: translate(110px,48px) rotate(22deg);} }

        .runner { animation: bob 0.64s ease-in-out infinite; transform-origin: center; }
        @keyframes bob { 0% { transform: translate(20px,10px) translateY(0) } 50% { transform: translate(20px,10px) translateY(-5px) } 100% { transform: translate(20px,10px) translateY(0) } }

        @media (max-width: 640px) {
          .runner-svg { width: 92%; max-width: 300px }
          .spice-particles { left: 30%; top: 54%; width: 120px; height: 90px }
        }
      `}</style>
    </div>
  )
}
