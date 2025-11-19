import React, { useEffect, useRef } from 'react';

// ScrollRevealText
// Props:
// - lines: array of strings (each line will be revealed in sequence)
// - className: optional wrapper classes
export default function ScrollRevealText({ lines = [], className = '' }) {
  const rootRef = useRef(null);
  // ScrollRevealText now relies on the global FullPageReveal controller.
  // The root element is marked with `reveal` so FullPageReveal will drive per-line progress.

  return (
    <div ref={rootRef} className={`reveal sr-root ${className}`}> 
      {lines.map((line, li) => (
        <div className="sr-line-wrapper overflow-hidden" key={li}>
          <div className="sr-line" aria-hidden>
            {line.split(' ').map((w, wi) => (
              <span
                key={wi}
                className="sr-word"
                style={{ transitionDelay: `${(wi + li * 6) * 45}ms` }}
              >
                <span className="sr-word-inner">{w}</span>
                {wi < line.split(' ').length - 1 ? <span className="sr-space">&nbsp;</span> : null}
              </span>
            ))}
          </div>
        </div>
      ))}

      <style jsx>{`
        .sr-root { display:block; width:100%; }
        .sr-line-wrapper { margin: 6px 0; }
        .sr-line { display:inline-block; will-change: transform, opacity; }
        .sr-word { display:inline-block; transform: translateY(110%); opacity:0; filter: blur(8px); transition: transform 680ms cubic-bezier(.16,.9,.34,1), opacity 520ms ease, filter 520ms ease; }
        .sr-word-inner { display:inline-block; padding:0 2px; color: #fefefe; font-weight:700; letter-spacing:0.02em; }
        .sr-space { display:inline-block; width:0.6ch; }

        /* futuristic neon stroke + subtle inner gradient */
        .sr-word-inner {
          background: linear-gradient(90deg, rgba(255,220,115,0.95), rgba(255,255,255,0.9));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 10px rgba(255,200,120,0.08), 0 0 24px rgba(255,180,80,0.06);
        }

        /* when line enters viewport */
        .sr-line.sr-in .sr-word,
        .sr-line.sr-in ~ .sr-line .sr-word { /* fallback */ }
        .sr-line.sr-in .sr-word { transform: translateY(0%); opacity:1; filter: blur(0); }

        /* add a subtle shine sweep using pseudo-element on the wrapper */
        .sr-line-wrapper { position: relative; }
        .sr-line-wrapper::after {
          content: '';
          position: absolute;
          left: -40%; top:0; bottom:0;
          width: 60%;
          pointer-events: none;
          transform: skewX(-18deg) translateX(-100%);
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 100%);
          mix-blend-mode: overlay;
          transition: transform 1.1s ease;
        }
        .sr-line.sr-in ~ .sr-line::after { transform: translateX(120%); }
        .sr-line.sr-in::after { transform: translateX(120%); }

        /* responsive tweaks */
        @media (max-width: 640px) {
          .sr-word-inner { font-size: 14px; }
        }
      `}</style>
    </div>
  );
}
