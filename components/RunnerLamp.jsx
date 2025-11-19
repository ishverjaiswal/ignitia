import React, { useEffect, useRef } from 'react'

export default function RunnerLamp({ className = '' }) {
  const wrapRef = useRef(null)

  useEffect(() => {
    // optional: small hover/touch glow follow (kept light-weight)
    const el = wrapRef.current
    if (!el) return

    function onMove(e) {
      const rect = el.getBoundingClientRect()
      const x = ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left) / rect.width
      const y = ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top) / rect.height
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

  return (
    <div ref={wrapRef} className={"runner-wrap w-full h-full flex items-center justify-center " + className}>
      <div className="runner-stage">
        {/* subtle animated lamp glow background */}
        <div className="lamp-glow" />

        {/* SVG character (stylized) */}
        <svg className="runner-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <defs>
            <radialGradient id="gLamp" cx="30%" cy="18%" r="45%">
              <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#ffd75a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
            </radialGradient>
          </defs>

          {/* ground shadow */}
          <ellipse cx="100" cy="170" rx="60" ry="10" fill="rgba(0,0,0,0.45)" />

          {/* body groups: we animate legs/arms via CSS targeting these groups */}
          <g className="runner" transform="translate(50,40)">
            {/* legs */}
            <g className="leg left-leg" transform="translate(40,95)">
              <rect x="-6" y="0" width="12" height="36" rx="4" fill="#0b0b0b" />
              <rect x="-10" y="34" width="20" height="10" rx="3" fill="#2b2b2b" />
            </g>
            <g className="leg right-leg" transform="translate(90,95)">
              <rect x="-6" y="0" width="12" height="36" rx="4" fill="#0b0b0b" />
              <rect x="-10" y="34" width="20" height="10" rx="3" fill="#2b2b2b" />
            </g>

            {/* torso */}
            <g className="torso" transform="translate(40,32)">
              <rect x="0" y="0" width="80" height="56" rx="10" fill="#0f0c0f" stroke="#3b2a00" strokeWidth="1" />
            </g>

            {/* arms: right arm holds lamp */}
            <g className="arm left-arm" transform="translate(18,52)">
              <rect x="-8" y="-6" width="28" height="12" rx="6" fill="#0b0b0b" />
            </g>
            <g className="arm right-arm" transform="translate(110,48)">
              <rect x="0" y="-6" width="34" height="12" rx="6" fill="#0b0b0b" />

              {/* lamp head */}
              <g className="lamp" transform="translate(36,-6)">
                <circle cx="6" cy="6" r="12" fill="url(#gLamp)" />
                <rect x="4" y="18" width="4" height="10" rx="1" fill="#836000" />
              </g>
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
        .runner-wrap { position: relative; }
        .runner-stage { width: 100%; height: 100%; display: flex; align-items:center; justify-content:center; }
        .runner-svg { width: 70%; height: auto; max-width: 420px; overflow: visible; }

        /* lamp glow that subtly follows pointer via CSS variables */
        .lamp-glow {
          position: absolute;
          left: var(--gx, 70%);
          top: var(--gy, 35%);
          width: 180px;
          height: 180px;
          transform: translate(-50%, -50%);
          pointer-events: none;
          background: radial-gradient(circle at 50% 40%, rgba(255,235,180,0.95) 0%, rgba(212,175,55,0.55) 20%, rgba(212,175,55,0.1) 45%, transparent 70%);
          filter: blur(18px);
          opacity: 0.9;
          mix-blend-mode: screen;
          animation: lampPulse 2.2s ease-in-out infinite;
          border-radius: 50%;
        }

        @keyframes lampPulse {
          0% { transform: translate(-50%, -50%) scale(0.98); opacity: 0.85 }
          50% { transform: translate(-50%, -50%) scale(1.06); opacity: 1 }
          100% { transform: translate(-50%, -50%) scale(0.98); opacity: 0.85 }
        }

        /* simple running leg animation */
        .left-leg, .right-leg { transform-origin: 0 0; }
        .left-leg { animation: legLeft 0.62s linear infinite; }
        .right-leg { animation: legRight 0.62s linear infinite; }

        @keyframes legLeft {
          0% { transform: translate(40px,95px) rotate(8deg); }
          50% { transform: translate(40px,95px) rotate(-30deg); }
          100% { transform: translate(40px,95px) rotate(8deg); }
        }
        @keyframes legRight {
          0% { transform: translate(90px,95px) rotate(-30deg); }
          50% { transform: translate(90px,95px) rotate(8deg); }
          100% { transform: translate(90px,95px) rotate(-30deg); }
        }

        /* arms swing */
        .left-arm { animation: armLeft 0.62s linear infinite; transform-origin: 22px 6px; }
        .right-arm { animation: armRight 0.62s linear infinite; transform-origin: 8px 6px; }
        @keyframes armLeft {
          0% { transform: translate(18px,52px) rotate(-10deg); }
          50% { transform: translate(18px,52px) rotate(24deg); }
          100% { transform: translate(18px,52px) rotate(-10deg); }
        }
        @keyframes armRight {
          0% { transform: translate(110px,48px) rotate(24deg); }
          50% { transform: translate(110px,48px) rotate(-10deg); }
          100% { transform: translate(110px,48px) rotate(24deg); }
        }

        /* small bobbing for torso/head to sell motion */
        .runner { animation: bob 0.62s ease-in-out infinite; transform-origin: center; }
        @keyframes bob { 0% { transform: translate(50px,40px) translateY(0) } 50% { transform: translate(50px,40px) translateY(-6px) } 100% { transform: translate(50px,40px) translateY(0) } }

        /* responsive reductions */
        @media (max-width: 640px) {
          .runner-svg { width: 92%; max-width: 260px; }
          .lamp-glow { width: 120px; height:120px; filter: blur(12px); }
        }
      `}</style>
    </div>
  )
}
