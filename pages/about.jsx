// pages/about.jsx
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import ChakraMeditation from '../components/ChakraMeditation'

export default function About() {
  const blobMountRef = useRef(null);
  const heroRef = useRef(null);
  const sectionsRef = useRef([]);

  // ---------- 3D LIQUID BLOB (Three.js via CDN) ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let frameId;
    let renderer, scene, camera, mesh, geometry;
    let originalPositions;
    let THREE;

    const container = blobMountRef.current;
    if (!container) return;

    const loadScript = (src, globalName) =>
      new Promise((resolve, reject) => {
        if (globalName && window[globalName]) return resolve(window[globalName]);
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () =>
          resolve(globalName ? window[globalName] : true);
        s.onerror = (e) => reject(e);
        document.head.appendChild(s);
      });

    const init = async () => {
      try {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r155/three.min.js",
          "THREE"
        );
        THREE = window.THREE;
      } catch (e) {
        console.warn("Three.js failed to load", e);
        return;
      }

      const width = container.clientWidth;
      const height = container.clientHeight || container.offsetWidth * 1.1;

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.outputEncoding = THREE.sRGBEncoding;
      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x020008, 0.65);

      camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
      camera.position.set(0, 0, 4.6);

      // Geometry: high-subdivision icosahedron -> jelly blob
      geometry = new THREE.IcosahedronGeometry(1.25, 6);
      originalPositions = Float32Array.from(
        geometry.attributes.position.array
      );

      const material = new THREE.MeshPhysicalMaterial({
        color: 0xffd36b,
        metalness: 0.4,
        roughness: 0.12,
        transmission: 0.9, // glass-like
        thickness: 1.7,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.2,
        sheen: 0.5,
        sheenColor: new THREE.Color(0xfff4d1),
      });

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Lights
      const keyLight = new THREE.SpotLight(0xfff0b3, 1.5, 0, Math.PI / 4, 0.6);
      keyLight.position.set(4, 4, 6);
      scene.add(keyLight);

      const fillLight = new THREE.PointLight(0x7b4dff, 1.2, 0, 2);
      fillLight.position.set(-3, -2, 3);
      scene.add(fillLight);

      const rimLight = new THREE.PointLight(0xff66aa, 1.0, 0, 2);
      rimLight.position.set(0, 3.5, -3);
      scene.add(rimLight);

      const ambient = new THREE.AmbientLight(0x221133, 0.7);
      scene.add(ambient);

      // Mouse-parallax
      const targetRot = { x: 0, y: 0 };
      const onPointerMove = (e) => {
        const rect = renderer.domElement.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        targetRot.y = x * 0.7;
        targetRot.x = -y * 0.6;
      };
      renderer.domElement.addEventListener("pointermove", onPointerMove);

      // Resize
      const onResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth;
        const h = container.clientHeight || w * 1.1;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      const animate = (t) => {
        const time = t * 0.0015;
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          const ox = originalPositions[i];
          const oy = originalPositions[i + 1];
          const oz = originalPositions[i + 2];

          const noise =
            Math.sin(time * 1.4 + ox * 1.7 + oy * 1.3 + oz * 0.9) * 0.16 +
            Math.cos(time * 0.8 + ox * 0.6 - oy * 1.1) * 0.06;

          const scale = 1 + noise;
          positions[i] = ox * scale;
          positions[i + 1] = oy * scale;
          positions[i + 2] = oz * scale;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        mesh.rotation.y += 0.004;
        mesh.rotation.x += 0.002;

        // ease blob towards mouse target
        mesh.rotation.x += (targetRot.x - mesh.rotation.x) * 0.04;
        mesh.rotation.y += (targetRot.y - mesh.rotation.y) * 0.04;

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };

      frameId = requestAnimationFrame(animate);

      // cleanup
      return () => {
        renderer.domElement.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("resize", onResize);
      };
    };

    let cleanupExtra;
    init().then((c) => {
      cleanupExtra = c;
    });

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      try {
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        }
        if (geometry) geometry.dispose();
      } catch (e) {}
      if (cleanupExtra) cleanupExtra();
    };
  }, []);

  // -------- Scroll reveal for sections --------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("about-section-visible");
          }
        });
      },
      { threshold: 0.18 }
    );

    sectionsRef.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#050007] text-gray-100 relative overflow-hidden">
      {/* Background glow + grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0530] via-[#050007] to-black opacity-80" />
        <div
          className="absolute inset-[-40%] opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 0%, rgba(248,220,129,0.15), transparent 55%), radial-gradient(circle at 80% 100%, rgba(147,99,255,0.12), transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            mixBlendMode: "soft-light",
          }}
        />
      </div>

      {/* Floating sparks */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <span
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#ffd36b]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.18 + Math.random() * 0.5,
              animation: `about-spark-float ${
                6 + Math.random() * 8
              }s linear infinite`,
              animationDelay: `${-Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      {/* HERO */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20 lg:pt-28">
        <section className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* 3D Liquid Blob Card */}
          <div className="w-full lg:w-[46%]">
            <div className="relative aspect-[4/5] max-w-md mx-auto rounded-[40px] bg-[#050007] shadow-[0_40px_120px_rgba(0,0,0,0.95)] overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 20% 0%, rgba(248,220,129,0.45), transparent 55%)",
                  filter: "blur(40px)",
                  opacity: 0.8,
                }}
              />
              <div className="absolute inset-[1px] rounded-[38px] bg-gradient-to-b from-[#090111] via-[#050007] to-[#020005]" />

              {/* Chakra animated scene (silhouette + golden halo + particles) */}
              <div className="absolute inset-0 z-5 pointer-events-none">
                <ChakraMeditation className="w-full h-full" />
              </div>

              {/* 3D mount */}
              <div
                ref={blobMountRef}
                className="relative z-10 w-full h-full"
              />
              {/* inner reflections */}
              <div
                className="pointer-events-none absolute inset-10 rounded-[32px]"
                style={{
                  background:
                    "radial-gradient(circle at 30% 10%, rgba(255,255,255,0.11), transparent 55%)",
                  mixBlendMode: "screen",
                  opacity: 0.5,
                }}
              />
            </div>
          </div>

          {/* Text side */}
          <div className="w-full lg:w-[54%]" ref={heroRef}>
            <p className="tracking-[0.35em] text-[11px] md:text-xs uppercase text-[#f4d57f]/80 mb-3">
              PSIT TECHNO–CULTURAL FESTIVAL
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-[3.3rem] font-extrabold leading-tight mb-4">
              <span className="block text-[#f5e7c3]">About</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#fbdc8c] via-[#f5e7c3] to-[#c9a33f]">
                IGNITIA
              </span>
            </h1>
            <p className="text-base md:text-lg text-gray-300/90 max-w-xl">
              IGNITIA is engineered as an immersive space — where stages, light,
              visuals and code fuse into a single, living experience that
              ripples across campus.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-black bg-gradient-to-r from-[#ffd764] via-[#ffe79c] to-[#f0c34b] shadow-[0_14px_40px_rgba(0,0,0,0.8)] hover:scale-[1.02] active:scale-[0.99] transition-transform"
              >
                Explore Events
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black/20">
                  ↗
                </span>
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-[#f5e7c3] border border-[#f5e7c3]/40 bg-black/30 hover:bg-white/5 transition"
              >
                View Gallery
              </Link>
            </div>
          </div>
        </section>

        {/* INFO SECTIONS */}
        <section className="mt-16 space-y-10 md:space-y-12">
          {[
            {
              title: "Vision",
              body:
                "To craft a festival that feels like stepping into the future while staying rooted in culture. IGNITIA exists where classical performance, digital art, AI and live coding share the same stage.",
            },
            {
              title: "Experience Layers",
              body:
                "Multi-stage performances, immersive light setups, esports & coding arenas, workshops, talks, installations and interactive zones designed as a continuous narrative across two days.",
            },
            {
              title: "Community",
              body:
                "Organized by students for students — with mentors, alumni and partners. Join as participant, performer, creator or volunteer and help shape the IGNITIA universe.",
            },
          ].map((block, i) => (
            <article
              key={i}
              ref={(el) => (sectionsRef.current[i] = el)}
              className="about-section opacity-0 translate-y-6 scale-[0.99] bg-black/40 rounded-2xl border border-[#f5e7c3]/10 px-6 py-6 md:px-8 md:py-7 backdrop-blur-sm relative overflow-hidden"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(circle at 0% 0%, rgba(248,220,129,0.18), transparent 55%)",
                }}
              />
              <h3 className="relative text-xl md:text-2xl font-semibold text-[#f5e7c3] mb-2">
                {block.title}
              </h3>
              <p className="relative text-sm md:text-base text-gray-300/90">
                {block.body}
              </p>
            </article>
          ))}
        </section>
      </main>

      {/* Extra styles for animations */}
      <style jsx>{`
        @keyframes about-spark-float {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-30px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
        .about-section {
          transition: opacity 700ms cubic-bezier(0.2, 0.9, 0.2, 1),
            transform 700ms cubic-bezier(0.2, 0.9, 0.2, 1);
        }
        .about-section-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      `}</style>
    </div>
  );
}
