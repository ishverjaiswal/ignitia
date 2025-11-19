// pages/home.jsx
import Head from "next/head";
import React, { useEffect, useRef } from "react";
import ScrollRevealText from '../components/ScrollRevealText'
// three.js and gsap are dynamically imported inside effects to avoid
// server-side bundling and Vercel build-time errors.

/* ============================================================================
   1) CINEMATIC HERO 3D — Black Temple + Golden Orb
============================================================================ */
function CinematicHero3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer = null;
    let frameId = null;
    let mounted = true;

    let scrollY = 0;
    let onScroll = null;

    (async () => {
      // dynamic imports keep these browser-only libraries out of server bundles
      const THREE = (await import('three'));
      const gsapModule = await import('gsap');
      const gsap = gsapModule?.default || gsapModule;

      const sizes = {
        width: mount.clientWidth || 800,
        height: mount.clientHeight || 450,
      };

      // Scene + Camera
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#000000");

      const camera = new THREE.PerspectiveCamera(
        40,
        sizes.width / sizes.height,
        0.1,
        200
      );
      camera.position.set(0, 2.5, 10);
      scene.add(camera);

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(sizes.width, sizes.height);
      renderer.setClearColor(0x000000, 1);
      mount.appendChild(renderer.domElement);

      // Lights
      const ambient = new THREE.AmbientLight(0xfff2cc, 0.25);
      scene.add(ambient);

      const keyLight = new THREE.SpotLight(0xffd184, 1.6, 40, Math.PI / 4, 0.5);
      keyLight.position.set(2.5, 8, 6);
      keyLight.target.position.set(0, 0, 0);
      scene.add(keyLight);
      scene.add(keyLight.target);

      const rimLight = new THREE.PointLight(0xff8b3d, 1.2, 40);
      rimLight.position.set(-4, 3, -6);
      scene.add(rimLight);

      // Root group
      const root = new THREE.Group();
      scene.add(root);

      // Temple base
      const baseGeo = new THREE.CylinderGeometry(4.5, 5.5, 0.8, 64);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x17100c,
        metalness: 0.4,
        roughness: 0.85,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = -2.2;
      root.add(base);

      // Floor ring
      const ringGeo = new THREE.RingGeometry(2.3, 3.6, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x7a5230,
        metalness: 0.9,
        roughness: 0.35,
        side: THREE.DoubleSide,
      });
      const floorRing = new THREE.Mesh(ringGeo, ringMat);
      floorRing.rotation.x = -Math.PI / 2;
      floorRing.position.y = -1.8;
      root.add(floorRing);

      // Pillars
      const pillarGeo = new THREE.BoxGeometry(0.6, 5.5, 0.6);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0x050203,
        metalness: 0.7,
        roughness: 0.6,
      });
      const pillarPositions = [
        [3.2, 0.8, 3.2],
        [-3.2, 0.8, 3.2],
        [3.2, 0.8, -3.2],
        [-3.2, 0.8, -3.2],
      ];
      pillarPositions.forEach(([x, y, z]) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(x, y, z);
        root.add(pillar);
      });

      // Golden orb
      const orbGeo = new THREE.SphereGeometry(1.1, 48, 48);
      const orbMat = new THREE.MeshPhysicalMaterial({
        color: 0xffc766,
        metalness: 0.2,
        roughness: 0.1,
        emissive: 0xff7a2a,
        emissiveIntensity: 1.9,
        clearcoat: 1,
        clearcoatRoughness: 0.15,
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.y = 0.3;
      root.add(orb);

      // track scroll-driven rotation/parallax
      onScroll = () => { scrollY = window.scrollY || window.pageYOffset || 0; };
      window.addEventListener('scroll', onScroll, { passive: true });

      // Light cone
      const coneGeo = new THREE.ConeGeometry(2.3, 5.2, 64, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0xffe3b0,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const lightCone = new THREE.Mesh(coneGeo, coneMat);
      lightCone.position.y = -0.5;
      lightCone.rotation.x = Math.PI;
      root.add(lightCone);

      // Halo plane (under orb)
      const haloCanvas = document.createElement("canvas");
      haloCanvas.width = 512;
      haloCanvas.height = 512;
      const hctx = haloCanvas.getContext("2d");
      const gradient = hctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, "rgba(255, 230, 160, 0.9)");
      gradient.addColorStop(0.45, "rgba(255, 160, 60, 0.18)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.0)");
      hctx.fillStyle = gradient;
      hctx.fillRect(0, 0, 512, 512);
      const haloTex = new THREE.CanvasTexture(haloCanvas);
      if ("colorSpace" in haloTex) {
        try { haloTex.colorSpace = 'srgb' } catch (e) { /* noop */ }
      } else if ("encoding" in haloTex && typeof THREE['sRGBEncoding'] !== 'undefined') {
        haloTex.encoding = THREE['sRGBEncoding'];
      }

      const haloMat = new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 });
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), haloMat);
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = -1.2;
      root.add(halo);

      // Dust particles
      const dustCount = 900;
      const dustGeo = new THREE.BufferGeometry();
      const dustPositions = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        const r = 9 * Math.random();
        const a = Math.random() * Math.PI * 2;
        const y = -2 + Math.random() * 7;
        dustPositions[i * 3 + 0] = Math.cos(a) * r;
        dustPositions[i * 3 + 1] = y;
        dustPositions[i * 3 + 2] = Math.sin(a) * r;
      }
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
      const dustMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, sizeAttenuation: true, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending });
      const dust = new THREE.Points(dustGeo, dustMaterial);
      root.add(dust);

      // Animations
      try {
        gsap.to(orb.scale, { x: 1.12, y: 1.12, z: 1.12, yoyo: true, repeat: -1, duration: 1.8, ease: "sine.inOut" });
        gsap.to(lightCone.scale, { x: 1.08, y: 1.1, z: 1.08, yoyo: true, repeat: -1, duration: 2.6, ease: "sine.inOut" });
        gsap.to(halo.scale, { x: 1.14, y: 1.14, yoyo: true, repeat: -1, duration: 3.1, ease: "sine.inOut" });
        gsap.to(camera.position, { x: 1.2, z: 9, duration: 14, yoyo: true, repeat: -1, ease: "sine.inOut" });
      } catch (e) {
        console.warn('GSAP animation skipped (failed to init):', e);
      }

      const mouse = { x: 0, y: 0 };
      const onMouseMove = (e) => {
        const rect = mount.getBoundingClientRect();
        mouse.x = (e.clientX - rect.left) / rect.width - 0.5;
        mouse.y = (e.clientY - rect.top) / rect.height - 0.5;
      };
      mount.addEventListener("mousemove", onMouseMove);

      const clock = new THREE.Clock();
      const target = new THREE.Vector3(0, 0, 0);

      const animate = () => {
        const t = clock.getElapsedTime();
        dust.rotation.y = t * 0.02;
        dust.rotation.x = Math.sin(t * 0.1) * 0.06;
        root.position.y = Math.sin(t * 0.4) * 0.1;
        const parallaxX = mouse.x * 0.8;
        const parallaxY = -mouse.y * 0.5;
        camera.position.x += (parallaxX - camera.position.x * 0.08);
        camera.position.y += (1.8 + parallaxY - camera.position.y) * 0.06;
        camera.lookAt(target);
        // scroll-linked mini-rotation for golden orb (adds to base rotation)
        const docHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const scrollNorm = Math.min(scrollY / docHeight, 1);
        // rotate orb slowly based on scroll position and elapsed time
        orb.rotation.y += 0.002 + scrollNorm * 0.008;
        // parallax: foreground (halo) moves faster, background (dust) moves slower
        halo.position.x = Math.sin(t * 0.2) * 0.05 + (scrollNorm - 0.5) * 0.18; // foreground sway
        dust.position.x = (scrollNorm - 0.5) * 0.06; // background subtle shift
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };
      animate();

      const onResize = () => {
        if (!mount) return;
        sizes.width = mount.clientWidth || 800;
        sizes.height = mount.clientHeight || 450;
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
        renderer.setSize(sizes.width, sizes.height);
      };
      window.addEventListener("resize", onResize);

      // cleanup when unmounting
      if (!mounted) {
        try { cancelAnimationFrame(frameId); } catch (e) {}
      }
    })();

    return () => {
      mounted = false;
      try { cancelAnimationFrame(frameId); } catch (e) {}
      try { window.removeEventListener("resize", () => {}); } catch (e) {}
      try { mount.removeEventListener("mousemove", () => {}); } catch (e) {}
      try { window.removeEventListener('scroll', onScroll); } catch (e) {}
      try {
        if (renderer && mount && mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
      } catch (e) {}
    };
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-[16/9]">
      {/* subtle golden aura but background stays black */}
      <div className="pointer-events-none absolute inset-[-15%] rounded-[999px] bg-[radial-gradient(circle,_rgba(255,200,120,0.12)_0%,_rgba(0,0,0,0)_60%)] blur-3xl" />
      <div ref={mountRef} className="relative w-full h-full" />
    </div>
  );
}

/* ============================================================================
   2) ABOUT IGNITIA 3D — Golden Mandala + Mascot
============================================================================ */
function AboutMandala3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer = null;
    let frameId = null;
    let mounted = true;

    (async () => {
      const THREE = (await import('three'));
      const gsapModule = await import('gsap');
      const gsap = gsapModule?.default || gsapModule;

      const sizes = { width: mount.clientWidth || 360, height: mount.clientHeight || 360 };
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#000000');

      const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 100);
      camera.position.set(0, 0, 8);
      scene.add(camera);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 1);
      mount.appendChild(renderer.domElement);

      // Lights
      scene.add(new THREE.AmbientLight(0xfff6d0, 0.4));
      const point = new THREE.PointLight(0xffc766, 1.6, 30);
      point.position.set(2, 3, 6);
      scene.add(point);

      // Root group
      const root = new THREE.Group();
      scene.add(root);

      // Outer mandala ring (torus)
      const outer = new THREE.Mesh(new THREE.TorusGeometry(3, 0.15, 40, 220), new THREE.MeshStandardMaterial({ color: 0xffd78c, metalness: 1, roughness: 0.3, emissive: 0xffc766, emissiveIntensity: 0.4 }));
      outer.rotation.x = Math.PI / 2;
      root.add(outer);

      const inner = new THREE.Mesh(new THREE.TorusGeometry(2, 0.12, 32, 180), new THREE.MeshStandardMaterial({ color: 0xf5c86a, metalness: 0.9, roughness: 0.3, emissive: 0xf2b24a, emissiveIntensity: 0.3 }));
      inner.rotation.x = Math.PI / 2;
      root.add(inner);

      const petalGeo = new THREE.ConeGeometry(0.28, 0.7, 12);
      const petalMat = new THREE.MeshStandardMaterial({ color: 0xffe0a0, metalness: 0.9, roughness: 0.3, emissive: 0xffc466, emissiveIntensity: 0.3 });
      const petalCount = 24;
      for (let i = 0; i < petalCount; i++) {
        const p = new THREE.Mesh(petalGeo, petalMat);
        const angle = (i / petalCount) * Math.PI * 2;
        const r = 2.55;
        p.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
        p.lookAt(0, 0, 0.5);
        root.add(p);
      }

      const mascot = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 32), new THREE.MeshPhysicalMaterial({ color: 0x1a0b00, metalness: 0.2, roughness: 0.6, clearcoat: 0.8 }));
      root.add(mascot);

      const flameGeo = new THREE.SphereGeometry(0.6, 24, 24);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffc95c, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(0, 0.1, 0.7);
      root.add(flame);

      const auraGeo = new THREE.RingGeometry(1.2, 1.9, 48);
      const auraMat = new THREE.MeshBasicMaterial({ color: 0xffeaa0, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      aura.rotation.x = Math.PI / 2;
      aura.position.z = -0.2;
      root.add(aura);

      try {
        gsap.to(outer.rotation, { z: "+=6.283", duration: 20, repeat: -1, ease: "none" });
        gsap.to(inner.rotation, { z: "-=6.283", duration: 16, repeat: -1, ease: "none" });
        gsap.to(root.rotation, { x: 0.2, duration: 8, yoyo: true, repeat: -1, ease: "sine.inOut" });
        gsap.to(flame.scale, { x: 1.2, y: 1.3, z: 1.2, yoyo: true, repeat: -1, duration: 1.7, ease: "sine.inOut" });
        gsap.to(aura.scale, { x: 1.18, y: 1.18, yoyo: true, repeat: -1, duration: 2.4, ease: "sine.inOut" });
      } catch (e) {
        console.warn('GSAP animations skipped for AboutMandala3D:', e);
      }

      const clock = new THREE.Clock();
      const animate = () => {
        const t = clock.getElapsedTime();
        mascot.rotation.y = t * 0.3;
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };
      animate();

      const onResize = () => {
        if (!mount) return;
        sizes.width = mount.clientWidth || 360;
        sizes.height = mount.clientHeight || 360;
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
        renderer.setSize(sizes.width, sizes.height);
      };
      window.addEventListener('resize', onResize);

      if (!mounted) {
        try { cancelAnimationFrame(frameId); } catch (e) {}
      }
    })();

    return () => {
      mounted = false;
      try { cancelAnimationFrame(frameId); } catch (e) {}
      try { window.removeEventListener('resize', () => {}); } catch (e) {}
      try { if (renderer && mount && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement); } catch (e) {}
    };
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      <div className="pointer-events-none absolute inset-[-12%] rounded-full bg-[radial-gradient(circle,_rgba(255,215,130,0.18)_0%,_rgba(0,0,0,0)_60%)] blur-2xl" />
      <div ref={mountRef} className="relative w-full h-full" />
    </div>
  );
}

/* ============================================================================
   3) EVENTS 3D — Golden Ring + Sparks (looping)
============================================================================ */
function EventsRing3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer = null;
    let frameId = null;
    let mounted = true;

    (async () => {
      const THREE = (await import('three'));
      const gsapModule = await import('gsap');
      const gsap = gsapModule?.default || gsapModule;

      const sizes = { width: mount.clientWidth || 360, height: mount.clientHeight || 260 };
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#000000');

      const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
      camera.position.set(0, 2.2, 8);
      camera.lookAt(0, 0, 0);
      scene.add(camera);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 1);
      mount.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xfff3ce, 0.4));
      const spot = new THREE.SpotLight(0xffd08a, 1.4, 30, Math.PI / 4, 0.4);
      spot.position.set(3, 5, 6);
      spot.target.position.set(0, 0, 0);
      scene.add(spot);
      scene.add(spot.target);

      const root = new THREE.Group();
      scene.add(root);

      const ground = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 0.2, 40), new THREE.MeshStandardMaterial({ color: 0x141015, metalness: 0.4, roughness: 0.8 }));
      ground.position.y = -1.2;
      root.add(ground);

      const mainRing = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.12, 40, 200), new THREE.MeshStandardMaterial({ color: 0xffd78c, metalness: 1, roughness: 0.28, emissive: 0xffc766, emissiveIntensity: 0.45 }));
      mainRing.rotation.x = Math.PI / 2;
      root.add(mainRing);

      const innerRing = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.09, 32, 180), new THREE.MeshStandardMaterial({ color: 0xf5c86a, metalness: 0.9, roughness: 0.3, emissive: 0xf2b24a, emissiveIntensity: 0.35 }));
      innerRing.rotation.x = Math.PI / 2;
      root.add(innerRing);

      const sparks = [];
      const sparkGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
      const sparkCount = 70;
      for (let i = 0; i < sparkCount; i++) {
        const s = new THREE.Mesh(sparkGeo, sparkMat);
        const r = 2.0 + Math.random() * 1.2;
        const a = Math.random() * Math.PI * 2;
        s.position.set(Math.cos(a) * r, 0.15 + (Math.random() - 0.5) * 0.6, Math.sin(a) * r);
        s.userData = { baseRadius: r, baseAngle: a, speed: 0.6 + Math.random() * 0.9, heightOffset: s.position.y };
        sparks.push(s);
        root.add(s);
      }

      try {
        gsap.to(mainRing.rotation, { z: "+=6.283", duration: 18, repeat: -1, ease: "none" });
        gsap.to(innerRing.rotation, { z: "-=6.283", duration: 14, repeat: -1, ease: "none" });
        gsap.to(root.position, { y: 0.2, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
      } catch (e) { console.warn('GSAP animations skipped for EventsRing3D', e); }

      const clock = new THREE.Clock();
      const animate = () => {
        const t = clock.getElapsedTime();
        sparks.forEach((s, i) => {
          const d = s.userData;
          const ang = d.baseAngle + t * d.speed * 0.4;
          const radius = d.baseRadius + Math.sin(t * 1.0 + i) * 0.15;
          s.position.set(Math.cos(ang) * radius, d.heightOffset + Math.sin(t * 1.6 + i) * 0.2, Math.sin(ang) * radius);
          s.material.opacity = 0.35 + (Math.sin(t * 3 + i) + 1) * 0.3;
        });
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };
      animate();

      const onResize = () => {
        if (!mount) return;
        sizes.width = mount.clientWidth || 360;
        sizes.height = mount.clientHeight || 260;
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
        renderer.setSize(sizes.width, sizes.height);
      };
      window.addEventListener('resize', onResize);

      if (!mounted) {
        try { cancelAnimationFrame(frameId); } catch (e) {}
      }
    })();

    return () => {
      mounted = false;
      try { cancelAnimationFrame(frameId); } catch (e) {}
      try { window.removeEventListener('resize', () => {}); } catch (e) {}
      try { if (renderer && mount && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement); } catch (e) {}
    };
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3]">
      <div className="pointer-events-none absolute inset-[-10%] bg-[radial-gradient(circle,_rgba(255,210,120,0.18)_0%,_rgba(0,0,0,0)_60%)] blur-2xl" />
      <div ref={mountRef} className="relative w-full h-full" />
    </div>
  );
}

/* ============================================================================
   MAIN PAGE — Text + 3D Sections
============================================================================ */
export default function Home() {
  return (
    <>
      <Head>
        <title>IGNITIA — 3D Futuristic Experience</title>
      </Head>

      <main className="min-h-screen bg-black text-white overflow-x-hidden">
        {/* HERO 3D ONLY */}
        <section className="relative pt-10 pb-6 px-6 md:px-10">
          <CinematicHero3D />
        </section>

        {/* HERO TEXT BELOW */}
        <section className="relative pb-20 px-6 md:px-10 bg-black">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1
              className="text-[2.4rem] md:text-[3.2rem] font-extrabold leading-tight tracking-[0.18em] md:tracking-[0.28em] uppercase text-[#f8d474] drop-shadow-[0_0_18px_rgba(0,0,0,0.9)]"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              WELCOME TO IGNITIA
            </h1>
            <p className="text-lg md:text-xl font-semibold text-[#ffdf80]">
              PSIT&apos;s annual techno-cultural extravaganza (28th–29th March)
            </p>
            <p className="text-base md:text-lg text-gray-100/95">
              Join us for <span className="font-semibold">“Abhivridhi”</span> — a celebration of growth,
              progress, and innovation. Ignitia brings together technology, culture,
              and creativity in a cinematic, immersive way.
            </p>
            <div className="mt-6 max-w-2xl mx-auto md:mx-0">
              <ScrollRevealText
                lines={[
                  'A futuristic festival where art, code and performance collide.',
                  'Immerse yourself in light, sound and motion — and spark your creative fire.'
                ]}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <a
                href="#about"
                className="inline-flex items-center justify-center px-9 py-3 rounded-full bg-gradient-to-r from-[#ffb347] via-[#ffe089] to-[#ff9f1c] text-black font-semibold text-sm md:text-base shadow-[0_12px_35px_rgba(0,0,0,0.9)] hover:scale-[1.03] transition-transform"
              >
                Know More →
              </a>
              <a
                href="#events"
                className="inline-flex items-center justify-center px-9 py-3 rounded-full border border-[#ffb347] text-[#ffdf80] font-semibold text-sm md:text-base bg-black/40 hover:bg-[#ffb347]/10 shadow-[0_10px_30px_rgba(0,0,0,0.9)] hover:scale-[1.03] transition-transform"
              >
                View Events
              </a>
            </div>
          </div>
        </section>

        {/* ABOUT IGNITIA WITH MANDALA 3D */}
        <section
          id="about"
          className="py-20 md:py-24 bg-[#050007] border-t border-white/5 px-6 md:px-10"
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-4 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#ffd979]">
                About IGNITIA
              </h2>
              <p className="text-base md:text-lg text-gray-200/95 leading-relaxed">
                Ignitia is more than just a fest — it&apos;s a catalyst for transformation.
                Over two electrifying days, PSIT&apos;s campus transforms into a vibrant
                arena of ideas, innovation, and imagination. Students explore their
                talents, build confidence, and create memories that last a lifetime.
              </p>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <AboutMandala3D />
            </div>
          </div>
        </section>

        {/* EVENTS & HIGHLIGHTS WITH RING 3D */}
        <section
          id="events"
          className="py-20 md:py-24 bg-[#040006] border-t border-white/5 px-6 md:px-10"
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#ffd979]">
                Events & Highlights
              </h2>
              <p className="text-base md:text-lg text-gray-200/95 leading-relaxed">
                From hackathons and coding battles to dance wars, musical nights,
                and creative showcases — Ignitia offers something for every spark
                of talent. Each event is designed to challenge, inspire, and
                celebrate the spirit of &quot;Abhivridhi&quot;.
              </p>
            </div>
            <div className="flex justify-center">
              <EventsRing3D />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
