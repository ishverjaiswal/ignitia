import { useEffect, useRef, useState, useCallback } from "react";
import Head from "next/head";

/* Helper: load external script and resolve when ready */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      return resolve();
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.body.appendChild(s);
  });
}

export default function GalleryPage() {
  const gridRef = useRef(null);
  const carouselRef = useRef(null);
  const carouselItemsRef = useRef([]);
  const particlesRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  // images (replace or extend as needed)
  const initialImages = [
    "/gallery/img1.svg",
    "/gallery/img2.svg",
    "/gallery/img3.svg",
    "/gallery/img4.svg",
    "/gallery/img5.svg",
    "/gallery/img6.svg",
    "https://picsum.photos/1200/800?random=11",
    "https://picsum.photos/1200/800?random=12",
    "https://picsum.photos/1200/800?random=13",
    "https://picsum.photos/1200/800?random=14",
    "https://picsum.photos/1200/800?random=15",
    "https://picsum.photos/1200/800?random=16",
  ];
  const [images] = useState(initialImages);

  // open modal and set index
  const openModal = useCallback((i) => {
    setModalIndex(i);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const showPrev = useCallback(() => {
    setModalIndex((s) => (s - 1 + images.length) % images.length);
  }, [images.length]);

  const showNext = useCallback(() => {
    setModalIndex((s) => (s + 1) % images.length);
  }, [images.length]);

  // keyboard navigation for modal
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalOpen, closeModal, showPrev, showNext]);

  // Particles (golden sparkles) - light-weight canvas
  useEffect(() => {
    let raf = null;
    const canvas = particlesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];
    const DPR = window.devicePixelRatio || 1;

    function resize() {
      canvas.width = canvas.clientWidth * DPR;
      canvas.height = canvas.clientHeight * DPR;
      ctx.scale(DPR, DPR);
    }
    function initParticles() {
      particles = [];
      const count = Math.max(30, Math.min(120, Math.floor((canvas.clientWidth * canvas.clientHeight) / 20000)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.clientWidth,
          y: Math.random() * canvas.clientHeight,
          r: Math.random() * 1.6 + 0.6,
          vx: (Math.random() - 0.5) * 0.2,
          vy: -Math.random() * 0.3 - 0.05,
          alpha: Math.random() * 0.8 + 0.2,
          life: Math.random() * 400 + 200,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0 || p.y < -10 || p.x < -10 || p.x > canvas.clientWidth + 10) {
          p.x = Math.random() * canvas.clientWidth;
          p.y = canvas.clientHeight + 10;
          p.life = Math.random() * 400 + 200;
          p.vx = (Math.random() - 0.5) * 0.2;
          p.vy = -Math.random() * 0.3 - 0.05;
          p.r = Math.random() * 1.6 + 0.6;
          p.alpha = Math.random() * 0.8 + 0.2;
        }
        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `rgba(255,215,0,${p.alpha})`);
        grad.addColorStop(0.4, `rgba(255,200,50,${p.alpha * 0.6})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [mounted]);

  // GSAP + ScrollTrigger animations + 3D carousel rotation
  useEffect(() => {
    setMounted(true);

    let ctxG = null;
    let gsap = null;
    let ScrollTrigger = null;
    let carouselTween = null;
    let hoverTweens = [];

    async function setupAnimations() {
      try {
        // load GSAP and ScrollTrigger from CDN at runtime
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js");
        gsap = window.gsap;
        ScrollTrigger = window.ScrollTrigger;
        if (!gsap || !ScrollTrigger) {
          console.warn("GSAP/ScrollTrigger failed to load.");
          return;
        }
        gsap.registerPlugin(ScrollTrigger);

        // Grid stagger reveal
        const cards = gridRef.current?.querySelectorAll(".gallery-card") || [];
        gsap.set(cards, { autoAlpha: 0, y: 30, scale: 0.98 });
        gsap.to(cards, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.06,
          delay: 0.2,
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
            toggleActions: "play none none reset",
          },
        });

        // Hover parallax & glow for each card
        cards.forEach((card) => {
          const img = card.querySelector("img");
          const tl = gsap.timeline({ paused: true });
          tl.to(card, { scale: 1.03, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", duration: 0.5, ease: "power3.out" }, 0);
          tl.to(img, { scale: 1.08, duration: 0.8, ease: "power3.out" }, 0);
          tl.to(card, { "--glow": "1", duration: 0.6 }, 0);
          hoverTweens.push({ card, tl });
          card.addEventListener("mouseenter", () => tl.play());
          card.addEventListener("mouseleave", () => tl.reverse());
        });

        // Scroll-triggered subtle up/down parallax for cards
        cards.forEach((card, i) => {
          gsap.to(card, {
            y: i % 2 === 0 ? -12 : 12,
            ease: "sine.inOut",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        });

        // 3D Carousel setup
        const carousel = carouselRef.current;
        const items = carouselItemsRef.current;
        const count = items.length;
        const radius = 420; // increased distance Z for hero look
        // position items in 3D ring
        items.forEach((el, i) => {
          const theta = (360 / count) * i;
          el.style.transform = `rotateY(${theta}deg) translateZ(${radius}px)`;
        });

        // animate rotation infinitely (slow, cinematic)
        carouselTween = gsap.to(carousel, {
          rotationY: 360,
          ease: "none",
          duration: 36,
          repeat: -1,
          modifiers: {
            rotationY: gsap.utils.unitize((v) => parseFloat(v) % 360),
          },
        });

        // neon rings rotation for subtle motion
        try {
          const rings = carousel.querySelector('.carousel-rings');
          if (rings) {
            gsap.to(rings, { rotation: 360, duration: 22, ease: 'linear', repeat: -1, transformOrigin: '50% 50%' });
          }
        } catch (e) {}

        // lighting streaks animation
        try {
          const streaks = carousel.querySelectorAll('.lighting-streaks .streak');
          if (streaks && streaks.length) {
            gsap.set(streaks, { position: 'absolute', display: 'block', width: '40%', height: 2, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,220,120,0.55), rgba(255,255,255,0))', opacity: 0.6, rotate: -12 });
            gsap.to(streaks, { xPercent: 220, duration: 3.8, ease: 'power1.inOut', repeat: -1, repeatDelay: 1.2, stagger: { each: 1.1 } });
          }
        } catch (e) {}

        // Pause on hover
        carousel.addEventListener("mouseenter", () => carouselTween.pause());
        carousel.addEventListener("mouseleave", () => carouselTween.resume());

        // Click to bring item forward
        items.forEach((el, idx) => {
          el.addEventListener("click", () => {
            const theta = (360 / count) * idx;
            gsap.to(carousel, {
              rotationY: -theta,
              duration: 1.2,
              ease: "power4.out",
            });
            gsap.fromTo(el, { scale: 0.95 }, { scale: 1.06, duration: 0.6, yoyo: true, repeat: 1, ease: "power1.inOut" });
            openModal(idx);
          });
        });

        // reveal animation for carousel section
        gsap.fromTo(
          carousel,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: carousel,
              start: "top 80%",
              toggleActions: "play none none reset",
            },
          }
        );

        ctxG = gsap.context(() => {}, carouselRef);
      } catch (err) {
        console.error("GSAP animation setup failed:", err);
      }
    }

    setupAnimations();

    return () => {
      try {
        if (window.gsap && window.gsap.context) {
          window.gsap.context(() => {}, carouselRef);
        }
        if (carouselTween) carouselTween.kill();
        hoverTweens.forEach((h) => {
          try {
            h.card.removeEventListener("mouseenter", h.tl.play);
            h.card.removeEventListener("mouseleave", h.tl.reverse);
          } catch (e) {}
          h.tl.kill?.();
        });
        if (ctxG) ctxG.revert?.();
      } catch (e) {}
    };
  }, [openModal]);

  return (
    <>
      <Head>
        <title>IGNITIA · Gallery</title>
        <meta name="description" content="IGNITIA - premium event gallery with 3D carousel and GSAP animations." />
      </Head>

      <main className="min-h-screen w-full text-white bg-gradient-to-b from-[#0b0211] via-[#11041a] to-[#0a0210] relative overflow-x-hidden">
        {/* Particle Canvas (behind content) */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <canvas ref={particlesRef} className="w-full h-full"></canvas>
        </div>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <header className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-[0_4px_24px_rgba(255,184,62,0.12)]">
              <span className="block">GALLERY</span>
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-2xl mx-auto">
              A premium, futuristic showcase of IGNITIA moments — immersive imagery, 3D galleries and cinematic motion.
            </p>
          </header>

          {/* 3D Carousel Hero (moved above grid) */}
          <section className="mb-20">
            
            <div className="relative">
              <div className="mx-auto w-full max-w-5xl perspective-3d" style={{ perspective: "1400px" }}>
                <div
                  ref={carouselRef}
                  className="carousel-container relative w-full h-[520px] mx-auto transform-style-preserve-3d"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* neon rings behind carousel */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg className="carousel-rings w-[520px] h-[520px] opacity-30" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="300" cy="300" r="140" stroke="rgba(255,200,60,0.06)" strokeWidth="18" />
                      <circle cx="300" cy="300" r="220" stroke="rgba(255,200,60,0.03)" strokeWidth="6" />
                      <circle cx="300" cy="300" r="270" stroke="rgba(255,200,60,0.02)" strokeWidth="4" />
                    </svg>
                  </div>

                  {/* lighting streaks */}
                  <div className="lighting-streaks pointer-events-none absolute inset-0 overflow-hidden">
                    <span className="streak" style={{ left: '-30%', top: '20%' }} />
                    <span className="streak" style={{ left: '-40%', top: '50%' }} />
                    <span className="streak" style={{ left: '-20%', top: '75%' }} />
                  </div>

                  {/* items positioned around ring */}
                  {images.map((src, i) => (
                    <div
                      key={`c-${i}`}
                      ref={(el) => (carouselItemsRef.current[i] = el)}
                      className="carousel-item absolute left-1/2 top-1/2 w-64 h-44 -translate-x-1/2 -translate-y-1/2 rounded-lg overflow-hidden cursor-pointer"
                      style={{
                        transformStyle: "preserve-3d",
                        transition: "box-shadow .3s ease, transform .4s ease",
                        boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
                        border: "3px solid rgba(255,215,0,0.08)",
                      }}
                    >
                      <img src={src} alt={`c-${i}`} className="w-full h-full object-cover" loading="lazy" />
                      <div style={{ position: "absolute", inset: 8, borderRadius: 8, boxShadow: "0 0 28px rgba(255,175,60,0.08) inset" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Grid Section */}
          <section className="mb-20">
            <h2 className="text-2xl font-medium text-yellow-400 mb-6">Featured Gallery</h2>
            <div ref={gridRef} className="gallery-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((src, i) => (
                <article
                  key={i}
                  className="gallery-card relative rounded-xl overflow-hidden border-2 border-transparent p-1"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))",
                    boxShadow: "inset 0 0 0 1px rgba(255,215,0,0.06)",
                    transition: "transform .35s ease, box-shadow .35s ease",
                  }}
                >
                  <div
                    className="card-inner relative overflow-hidden rounded-lg"
                    onClick={() => openModal(i)}
                    role="button"
                    tabIndex={0}
                  >
                    <img
                      src={src}
                      alt={`gallery-${i}`}
                      className="w-full h-60 object-cover transform transition-transform duration-700"
                      loading="lazy"
                      style={{
                        willChange: "transform",
                      }}
                    />
                    {/* glass overlay */}
                    <div className="absolute inset-0 pointer-events-none"
                      style={{
                        background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                        mixBlendMode: "overlay",
                      }}
                    />
                    {/* golden frame glow */}
                    <div className="absolute inset-0 pointer-events-none rounded-lg"
                      style={{
                        boxShadow: "0 0 28px rgba(255,200,60,0.12), inset 0 0 8px rgba(255,190,60,0.06)",
                        borderRadius: 12,
                        border: "2px solid rgba(255,200,60,0.07)",
                      }}
                    />
                    {/* caption */}
                    <div className="absolute left-4 bottom-4 text-left">
                      <div className="bg-black/40 backdrop-blur px-3 py-1 rounded-md text-sm text-yellow-100">IGNITIA</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          
        </section>

        {/* Fullscreen Modal */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backdropFilter: "blur(6px)", background: "rgba(4,3,6,0.6)" }}
            onClick={closeModal}
          >
            <div
              className="relative max-w-[90vw] max-h-[90vh] w-[1200px] rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={images[modalIndex]} alt="full" className="w-full h-full object-contain bg-black" />
              {/* golden frame */}
              <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "0 0 48px rgba(255,198,60,0.18), inset 0 0 20px rgba(255,198,60,0.06)", border: "4px solid rgba(255,200,60,0.06)" }} />
              {/* controls */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white bg-black/40 border border-yellow-200/10 rounded-full p-2"
                aria-label="Close"
              >
                ✕
              </button>
              <button
                onClick={showPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-3 border border-yellow-200/10"
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                onClick={showNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-3 border border-yellow-200/10"
                aria-label="Next"
              >
                ›
              </button>
            </div>
          </div>
        )}

        {/* small attribution / footer spacing */}
        <div className="h-24" />
      </main>

      {/* Inline styling for neon/glass effects */}
      <style jsx>{`
        .gallery-card {
          --glow: 0;
          transition: transform 300ms ease, box-shadow 300ms ease;
        }
        .gallery-card:hover {
          transform: translateY(-6px);
        }
        .gallery-card img {
          transition: transform 700ms cubic-bezier(0.2, 0.9, 0.2, 1);
        }
        .perspective-3d .carousel-container {
          transform-style: preserve-3d;
          transform: translateZ(-180px) rotateX(6deg);
        }
        .lighting-streaks .streak {
          position: absolute;
          top: 0;
          left: 0;
          display: block;
          pointer-events: none;
          border-radius: 999px;
          filter: blur(6px);
          mix-blend-mode: screen;
        }
        /* make carousel items respond to lighting */
        .carousel-item img {
          transition: transform 500ms ease, filter 400ms ease;
        }
        .carousel-item:hover {
          transform: translateZ(40px) scale(1.04);
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.6));
        }
      `}</style>
    </>
  );
}
