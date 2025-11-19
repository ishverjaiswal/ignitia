import React, { useEffect, useRef } from 'react';

// High-quality 3D Chakra Meditation scene (Three.js) — dynamic imports only
export default function ChakraMeditation3D({ className = '' }) {
  const canvasRef = useRef(null);
  const cleanupRef = useRef(() => {});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let mounted = true;
    let loopId = null;
    let renderer, scene, camera, composer;
    let width = 0, height = 0;
    const loopDuration = 6.0; // seconds — perfect looping period

    (async function init() {
      // dynamic imports (client-only)
      const THREE = await import('three');
      const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
      const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
      const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');

      if (!mounted) return;

      const el = canvasRef.current;
      width = el.clientWidth || 800;
      height = el.clientHeight || 800;

      // Renderer with alpha for transparent background
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: el });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.setClearColor(0x000000, 0);

      // Scene & Camera
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      camera.position.set(0, 0, 6.2);

      // Subtle hemisphere for soft fill
      const hemi = new THREE.HemisphereLight(0xfff7d9, 0x220033, 0.6);
      scene.add(hemi);

      // Key directional light for rim & depth
      const key = new THREE.DirectionalLight(0xfff0b3, 1.2);
      key.position.set(5, 6, 7);
      scene.add(key);

      // Add soft volumetric-ish point lights (for rim)
      const rimA = new THREE.PointLight(0xffd66b, 0.9, 0, 2);
      rimA.position.set(-3, 3.5, -4);
      scene.add(rimA);
      const rimB = new THREE.PointLight(0xff66ff, 0.6, 0, 2);
      rimB.position.set(3, 2.6, -3);
      scene.add(rimB);

      // Group root
      const root = new THREE.Group();
      scene.add(root);

      // --- Silhouette (stylized, smooth lotus pose approximation) ---
      // Build silhouette by composing smooth primitives and merging them so edges are clean.
      const silhouetteGroup = new THREE.Group();

      const bodyMat = new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        metalness: 0.05,
        roughness: 0.25,
        clearcoat: 0.3,
        reflectivity: 0.4,
        transmission: 0.0,
      });

      // Head
      const headGeo = new THREE.SphereGeometry(0.38, 48, 32);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(0, 1.4, 0);
      silhouetteGroup.add(head);

      // Torso (rounded capsule-like)
      const torsoGeo = new THREE.CapsuleGeometry(0.48, 1.1, 32, 64);
      const torso = new THREE.Mesh(torsoGeo, bodyMat);
      torso.position.set(0, 0.45, 0);
      silhouetteGroup.add(torso);

      // Legs - two rounded tori approximating crossed lotus legs
      const legOuter = new THREE.TorusGeometry(0.95, 0.22, 24, 60, Math.PI * 1.1);
      const leftLeg = new THREE.Mesh(legOuter, bodyMat);
      leftLeg.rotation.set(-0.9, 0.6, 0.1);
      leftLeg.position.set(-0.05, -0.25, 0);
      silhouetteGroup.add(leftLeg);

      const rightLeg = leftLeg.clone();
      rightLeg.rotation.set(-0.9, -0.6, -0.1);
      rightLeg.position.set(0.02, -0.26, 0);
      silhouetteGroup.add(rightLeg);

      // Arms in gyan mudra — approximated by slender torus segments
      const armGeo = new THREE.TorusGeometry(0.65, 0.12, 18, 60, Math.PI * 0.9);
      const leftArm = new THREE.Mesh(armGeo, bodyMat);
      leftArm.rotation.set(-1.1, 0.55, 0.3);
      leftArm.position.set(-0.9, 0.2, 0);
      silhouetteGroup.add(leftArm);

      const rightArm = leftArm.clone();
      rightArm.rotation.set(-1.1, -0.55, -0.3);
      rightArm.position.set(0.9, 0.2, 0);
      silhouetteGroup.add(rightArm);

      // Slight merge: add group as single object for export/outline
      silhouetteGroup.traverse((m) => {
        m.castShadow = false;
        m.receiveShadow = false;
      });

      silhouetteGroup.scale.set(1.05, 1.05, 1.05);
      root.add(silhouetteGroup);

      // Rim layer: slightly bigger clone with additive fresnel shader for rim glow
      const rimMat = new THREE.ShaderMaterial({
        uniforms: {
          viewDir: { value: new THREE.Vector3(0, 0, 1) },
          rimColor: { value: new THREE.Color(0xffd86b) },
          power: { value: 1.6 },
          opacity: { value: 0.9 },
        },
        vertexShader: `varying vec3 vNormal; varying vec3 vWorldPos; void main(){ vNormal = normalize(normalMatrix * normal); vWorldPos = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 rimColor; uniform float power; uniform float opacity; varying vec3 vNormal; varying vec3 vWorldPos; void main(){ float fres = pow(1.0 - max(0.0, dot(normalize(vNormal), vec3(0.0,0.0,1.0))), power); gl_FragColor = vec4(rimColor * fres, fres * opacity); }`,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      });

      // create rim meshes by cloning silhouettes and slightly scaling
      const rimGroup = silhouetteGroup.clone(true);
      rimGroup.traverse((c) => {
        if (c.isMesh) {
          c.material = rimMat;
          c.scale.multiplyScalar(1.012);
        }
      });
      root.add(rimGroup);

      // --- Chakras: seven neon mandalas ---
      const chakraColors = [
        0xff3b30, // Root - Red
        0xff8c00, // Sacral - Orange
        0xffd300, // Solar - Yellow
        0x00d084, // Heart - Green
        0x4db9ff, // Throat - Blue
        0x6b4bff, // Third Eye - Indigo
        0xc57bff, // Crown - Violet
      ];

      const chakraY = [ -0.9, -0.3, 0.2, 0.75, 1.05, 1.45, 1.85 ];

      const chakras = new THREE.Group();
      root.add(chakras);

      for (let i = 0; i < 7; i++) {
        const size = 0.28 + (i === 2 ? 0.12 : 0) + (i === 3 ? 0.04 : 0);
        const ring = new THREE.TorusGeometry(size, 0.02, 24, 120);

        const mat = new THREE.MeshBasicMaterial({
          color: chakraColors[i],
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          toneMapped: false,
        });

        // Outer neon ring
        const ringMesh = new THREE.Mesh(ring, mat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = chakraY[i];
        chakras.add(ringMesh);

        // inner rotating mandala using lathe of points to create spikey mandala
        const spikes = new THREE.BufferGeometry();
        const segs = 64;
        const positions = new Float32Array(segs * 3);
        for (let j = 0; j < segs; j++) {
          const a = (j / segs) * Math.PI * 2;
          const r = size * (0.45 + 0.15 * Math.sin(a * 6 + i));
          positions[j * 3] = Math.cos(a) * r;
          positions[j * 3 + 1] = Math.sin(a) * r;
          positions[j * 3 + 2] = 0;
        }
        spikes.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const spMat = new THREE.PointsMaterial({
          color: chakraColors[i],
          size: 0.045,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.94,
          blending: THREE.AdditiveBlending,
        });
        const spikesPoints = new THREE.Points(spikes, spMat);
        spikesPoints.position.y = chakraY[i];
        chakras.add(spikesPoints);

        // breathing scale stored on object for animation
        ringMesh.userData = { baseScale: 1.0, rotSpeed: 0.24 + i * 0.02 };
        spikesPoints.userData = { baseScale: 1.0, rotSpeed: -0.34 - i * 0.015 };
      }

      // --- Particles (rising spiritual energy) ---
      const particleCount = Math.min(600, Math.floor((width * height) / 2200));
      const particleGeo = new THREE.BufferGeometry();
      const ppos = new Float32Array(particleCount * 3);
      const prad = new Float32Array(particleCount);
      for (let i = 0; i < particleCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 0.15 + Math.random() * 1.3;
        ppos[i * 3] = Math.cos(a) * r * (Math.random() * 0.5 + 0.6);
        ppos[i * 3 + 1] = -1.2 + Math.random() * 3.6;
        ppos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
        prad[i] = Math.random() * 0.9 + 0.2;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
      particleGeo.setAttribute('aRadius', new THREE.BufferAttribute(prad, 1));
      const particleMat = new THREE.PointsMaterial({
        color: 0xffd36b,
        size: 0.018,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      root.add(particles);

      // Golden spark larger ones
      const goldGeo = new THREE.BufferGeometry();
      const goldCount = 28;
      const gpos = new Float32Array(goldCount * 3);
      for (let i = 0; i < goldCount; i++) {
        gpos[i * 3] = (Math.random() - 0.5) * 4.2;
        gpos[i * 3 + 1] = -1.4 + Math.random() * 4.6;
        gpos[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
      }
      goldGeo.setAttribute('position', new THREE.BufferAttribute(gpos, 3));
      const goldMat = new THREE.PointsMaterial({
        color: 0xffd36b,
        size: 0.035,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const goldSparks = new THREE.Points(goldGeo, goldMat);
      root.add(goldSparks);

      // Swirling energy wave (thin transparent torus that breathes)
      const swirlGeo = new THREE.TorusGeometry(1.6, 0.14, 6, 160);
      const swirlMat = new THREE.MeshBasicMaterial({
        color: 0xffd86b,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      });
      const swirl = new THREE.Mesh(swirlGeo, swirlMat);
      swirl.rotation.x = Math.PI / 2.1;
      swirl.position.set(0, 0.0, 0);
      root.add(swirl);

      // Postprocessing composer for bloom
      composer = new EffectComposer(renderer);
      composer.setSize(width, height);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);
      const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.9, 0.6, 0.2);
      bloom.threshold = 0.1;
      bloom.strength = 1.1;
      bloom.radius = 0.8;
      composer.addPass(bloom);

      // Perfect loop timing helpers
      const start = performance.now();

      function animate(now) {
        if (!mounted) return;
        const elapsed = (now - start) / 1000.0; // seconds
        // normalized time [0,1)
        const t = (elapsed % loopDuration) / loopDuration;
        const phase = t * Math.PI * 2;

        // Animate chakras: rotate and breathe (using sin to ensure looping)
        chakras.children.forEach((c, idx) => {
          const base = c.userData?.baseScale ?? 1;
          const spd = c.userData?.rotSpeed ?? (0.2 + idx * 0.02);
          c.rotation.z = phase * spd;
          const breathe = 1.0 + Math.sin(phase * (1.0 + idx * 0.05) * 1.0) * 0.06;
          c.scale.set(breathe * base, breathe * base, breathe * base);
        });

        // particles rise in a periodic loop (wrap-around using sin for perfect looping)
        const positions = particleGeo.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const idx3 = i * 3;
          const seed = (i * 32747) % 101 / 101;
          const baseY = -1.4 + seed * 4.6;
          positions[idx3 + 1] = baseY + ((Math.sin(phase * 2 + seed * Math.PI * 2) + 1) / 2) * 0.0001 + (Math.sin(phase * 2 + seed) * 0.3);
        }
        particleGeo.attributes.position.needsUpdate = true;

        // gold sparks gentle bob and twinkle
        const gpositions = goldGeo.attributes.position.array;
        for (let i = 0; i < goldCount; i++) {
          const idx3 = i * 3;
          gpositions[idx3 + 1] += Math.sin(phase * 2 + i) * 0.002;
        }
        goldGeo.attributes.position.needsUpdate = true;

        // swirl breathing
        const swirlBreathe = 1.0 + Math.sin(phase * 1.0) * 0.03;
        swirl.scale.set(swirlBreathe, swirlBreathe, swirlBreathe);

        // gentle root group rotation for life
        root.rotation.y = Math.sin(phase * 0.5) * 0.03;

        // render with bloom
        composer.render();

        loopId = requestAnimationFrame(animate);
      }

      loopId = requestAnimationFrame(animate);

      // Expose simple export helpers on window
      window.__chakra3d = window.__chakra3d || {};
      window.__chakra3d.exportWebM = async function exportWebM(durationSec = loopDuration) {
        return new Promise((resolve) => {
          try {
            const stream = el.captureStream(60);
            const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
            const chunks = [];
            rec.ondataavailable = (e) => chunks.push(e.data);
            rec.onstop = () => {
              const blob = new Blob(chunks, { type: 'video/webm' });
              resolve(blob);
            };
            rec.start();
            setTimeout(() => rec.stop(), durationSec * 1000);
          } catch (e) {
            console.warn('WebM export failed', e);
            resolve(null);
          }
        });
      };

      window.__chakra3d.exportGLB = async function exportGLB() {
        try {
          const exporter = new GLTFExporter();
          return new Promise((resolve) => {
            exporter.parse(root, (gltf) => {
              // gltf is JSON object; if user wants binary, further conversion needed
              resolve(gltf);
            }, { binary: false });
          });
        } catch (e) {
          console.warn('GLB export failed', e);
          return null;
        }
      };

      // store cleanup
      cleanupRef.current = () => {
        mounted = false;
        if (loopId) cancelAnimationFrame(loopId);
        try {
          if (composer) composer.dispose();
          if (renderer) {
            renderer.dispose();
            if (renderer.domElement && renderer.domElement.parentNode)
              renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        } catch (e) {}
      };
    })();

    const onResize = () => {
      if (!canvasRef.current || !renderer) return;
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight || w;
      width = w;
      height = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer && composer.setSize) composer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      try {
        cleanupRef.current && cleanupRef.current();
      } catch (e) {}
    };
  }, []);

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
