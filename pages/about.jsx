import React, { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

export default function About() {
  const heroRef = useRef(null)
  const heroTitleRef = useRef(null)
  const lottieRef = useRef(null)
  const sectionsRef = useRef([])

  useEffect(() => {
    let gsap, ScrollTrigger
    let ctx
    let lottiePlayer, lottieAnim
    const run = async () => {
      if (typeof window === 'undefined') return
      // Respect user's reduced motion preference
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReduced) return

      // To avoid build-time module resolution errors when `gsap` / `lottie-web`
      // aren't installed, load them at runtime from a CDN. This keeps the
      // bundle small and prevents Next.js from trying to resolve these modules
      // during server-side builds.
      const loadScript = (src, globalName) => new Promise((res, rej) => {
        try {
          if (globalName && window[globalName]) return res(window[globalName])
          const s = document.createElement('script')
          s.src = src
          s.async = true
          s.onload = () => res(globalName ? window[globalName] : true)
          s.onerror = (e) => rej(e)
          document.head.appendChild(s)
        } catch (e) { rej(e) }
      })

      try {
        // GSAP CDN (version-agnostic small loader)
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', 'gsap')
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js', 'ScrollTrigger')
        gsap = window.gsap
        ScrollTrigger = window.ScrollTrigger || (gsap && gsap.plugins && gsap.plugins.ScrollTrigger)
        if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger)
      } catch (err) {
        console.warn('GSAP/ScrollTrigger failed to load from CDN', err)
        return
      }

      // Load lottie-web from CDN (optional)
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/lottie-web@5.11.2/build/player/lottie.min.js', 'lottie')
        lottiePlayer = window.lottie
        if (lottiePlayer && lottieRef.current) {
          const animUrl = 'https://assets10.lottiefiles.com/packages/lf20_jcikwtux.json'
          lottieAnim = lottiePlayer.loadAnimation({
            container: lottieRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: animUrl,
          })
        }
      } catch (err) {
        console.warn('Lottie failed to load from CDN', err)
      }

      ctx = gsap.context(() => {
        // hero reveal (fade + lift)
        gsap.from(heroRef.current, { opacity: 0, y: -30, duration: 1, ease: 'power3.out' })

        // SPLIT TEXT: wrap each character in a span for scrubbed reveal
        const titleEl = heroTitleRef.current
        if (titleEl) {
          const text = titleEl.textContent.trim()
          titleEl.innerHTML = ''
          const frag = document.createDocumentFragment()
          for (let ch of text) {
            const s = document.createElement('span')
            s.textContent = ch
            s.style.display = 'inline-block'
            s.style.transform = 'translateY(0)'
            s.style.willChange = 'transform, opacity'
            frag.appendChild(s)
          }
          titleEl.appendChild(frag)

          // scrubbed animation: characters move up as user scrolls the hero
          gsap.to(titleEl.children, {
            y: -30,
            opacity: 1,
            stagger: 0.02,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom+=200 top',
              scrub: 0.6
            }
          })
        }

        // stagger sections with intersection-driven ScrollTrigger
        sectionsRef.current.forEach((el) => {
          if (!el) return
          gsap.fromTo(el, { y: 40, opacity: 0, scale: 0.98 }, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              end: 'bottom 30%',
              toggleActions: 'play none none reverse'
            }
          })
        })

        // subtle parallax on background elements
        gsap.to('.bg-arc', {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: { scrub: true }
        })
      })
    }

    run()

    return () => {
      // revert gsap context (kills timelines created inside it)
      try { if (ctx) ctx.revert() } catch (e) {}
      // kill any ScrollTrigger instances created outside the context
      try {
        if (ScrollTrigger && typeof ScrollTrigger.getAll === 'function') {
          const all = ScrollTrigger.getAll() || []
          all.forEach((st) => { try { st.kill && st.kill() } catch (e) {} })
        }
      } catch (e) {}
      // destroy lottie animation instance if created
      try { if (typeof lottieAnim !== 'undefined' && lottieAnim && typeof lottieAnim.destroy === 'function') lottieAnim.destroy() } catch (e) {}
    }
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full opacity-20 bg-arc" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="rg" cx="50%" cy="30%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.12" />
              <stop offset="40%" stopColor="#5a2a6d" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#rg)" />
          <g fill="none" stroke="#D4AF37" strokeOpacity="0.06">
            <circle cx="20%" cy="30%" r="240" />
            <circle cx="80%" cy="70%" r="320" />
          </g>
        </svg>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <header ref={heroRef} className="text-center max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-6">
            <div ref={lottieRef} className="w-40 h-40 mx-auto" aria-hidden />
            <h1 ref={heroTitleRef} className="text-4xl md:text-5xl font-extrabold" style={{ color: '#F5E7C3', letterSpacing: '0.6px' }}>About IGNITIA</h1>
            <p className="mt-4 text-lg text-gray-300">A premier festival blending culture, technology and performance — where artists, coders and creators converge.</p>
          </div>
        </header>

        <section className="mt-12 space-y-12">
          {[
            {
              title: 'Our Vision',
              body: 'To craft an immersive festival experience that honors heritage while embracing future-facing creativity. IGNITIA is designed as a bridge between tradition and innovation.'
            },
            {
              title: 'What To Expect',
              body: 'Live performances, interactive installations, coding jams, workshops, keynote talks, and curated exhibitions — all wrapped in an elegant, high-production presentation.'
            },
            {
              title: 'Community & Participation',
              body: 'We welcome students, professionals, and enthusiasts. Join workshops, submit to exhibitions, or volunteer to be on the ground.'
            }
          ].map((s, i) => (
            <article key={i} ref={el => sectionsRef.current[i] = el} className="bg-black/50 p-8 rounded-2xl border" style={{ borderColor: 'rgba(212,175,55,0.06)' }}>
              <h3 className="text-2xl font-semibold" style={{ color: '#D4AF37' }}>{s.title}</h3>
              <p className="mt-3 text-gray-300">{s.body}</p>
              <div className="mt-4">
                <Link href="/events" className="text-yellow-300">See events &rarr;</Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
