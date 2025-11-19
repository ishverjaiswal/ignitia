import React, { useEffect } from 'react';

// FullPageReveal: observe elements with `.reveal` and add `sr-in` when they enter view.
export default function FullPageReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      // Immediately reveal all
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('sr-in'));
      return;
    }
    // We'll observe elements to start driving a scroll-linked reveal.
    const reveals = Array.from(document.querySelectorAll('.reveal'));

    function clamp(v, a = 0, b = 1) {
      return Math.max(a, Math.min(b, v));
    }

    // compute progress of element visibility [0..1]
    function elementProgress(el) {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // progress = 0 when element bottom is at viewport top, 1 when element top reaches viewport bottom
      const start = vh; // element bottom at viewport bottom -> start visible
      const total = vh + rect.height;
      const visible = clamp((vh - rect.top) / total, 0, 1);
      return visible;
    }

    function update() {
      reveals.forEach((el) => {
        const progress = elementProgress(el);
        // mark element as entering if any progress
        if (progress > 0.02) el.classList.add('sr-in');

        // handle child reveal items (words/lines or reveal-child)
        const children = Array.from(el.querySelectorAll('.sr-word, .sr-line, .reveal-child'));
        const staggerSec = 0.15; // desired stagger per sentence (seconds equivalent)
        // Map stagger seconds to fraction of progress; use 0.15 fraction for clear stagger
        const offsetFrac = 0.15; // base fraction offset per item (approx)

        children.forEach((c, i) => {
          const itemOffset = i * offsetFrac;
          const local = clamp((progress - itemOffset) / (1 - itemOffset), 0, 1);
          // translate from 10->25px depending on element height (use 18px default)
          const translate = 10 + 15 * (1 - local); // 10 -> 25px depending on progress
          const opacity = local;
          c.style.transform = `translateY(${translate}px)`;
          c.style.opacity = String(opacity);
          c.style.filter = local < 0.01 ? 'blur(8px)' : 'none';
        });
      });
    }

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }

    // initial set
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, []);

  // include a minimal style block scoped to the document (applies globally when component mounts)
  return (
    <style jsx global>{`
      .reveal { opacity: 0; transform: translateY(18px); transition: opacity 640ms cubic-bezier(.16,.9,.34,1), transform 640ms cubic-bezier(.16,.9,.34,1); }
      .reveal.sr-in { opacity: 1; transform: translateY(0); }
      .reveal .reveal-child { opacity: 0; transform: translateY(8px); display: inline-block; transition: transform 620ms cubic-bezier(.16,.9,.34,1), opacity 520ms ease; }
      .reveal.sr-in .reveal-child { opacity: 1; transform: translateY(0); }
      /* subtle futuristic glow for headings inside reveal */
      .reveal h1, .reveal h2, .reveal h3 { text-shadow: 0 6px 24px rgba(0,0,0,0.6); }
      .reveal .btn-glow { transition: transform 420ms ease, box-shadow 420ms ease; }
      .reveal.sr-in .btn-glow { transform: translateY(0); box-shadow: 0 12px 40px rgba(255,180,60,0.12); }
      /* Image overlay style (neon/futuristic) */
      .image-overlay { position: absolute; right: 3.25rem; top: 8%; max-width: 48%; pointer-events: none; }
      .image-overlay .bubble { display:inline-block; background: linear-gradient(180deg, rgba(0,0,0,0.45), rgba(10,6,6,0.28)); border: 1px solid rgba(255,200,110,0.12); padding: 10px 14px; border-radius: 12px; backdrop-filter: blur(6px); }
      .image-overlay .bubble .text { color: transparent; background: linear-gradient(90deg, #ffd36b, #fff6e0); -webkit-background-clip: text; background-clip: text; font-weight:700; text-shadow: 0 6px 28px rgba(255,190,80,0.06), 0 0 18px rgba(255,160,60,0.06); }
      .image-overlay.sr-in { transform: translateY(0); opacity:1; }
      .image-overlay { transform: translateY(8px); opacity:0; transition: transform 680ms cubic-bezier(.16,.9,.34,1), opacity 640ms ease; }
      @media (max-width: 900px) { .image-overlay { right: 2rem; top: 6%; max-width: 60%; } }
    `}</style>
  );
}
