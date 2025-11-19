import React, { useEffect, useRef } from 'react'

export default function HoneycombHero({ className = '' }) {
  const mountRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let mounted = true
    let renderer, scene, camera, instMesh, material, geometry
    let clockStart = performance.now()

    ;(async () => {
      const mod = await import('three')
      const THREE = mod.default || mod

      const container = mountRef.current
      if (!container || !mounted) return

      const width = container.clientWidth || container.offsetWidth || 800
      const height = container.clientHeight || 500
      const dpr = Math.min(2, window.devicePixelRatio || 1)

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(dpr)
      renderer.setSize(width, height)
      renderer.setClearColor(0x000000, 0)
      container.appendChild(renderer.domElement)

      scene = new THREE.Scene()

      // Orthographic camera makes it easy to map pixels -> world units for grid layout
      camera = new THREE.OrthographicCamera(
        -width / 2,
        width / 2,
        height / 2,
        -height / 2,
        -1000,
        1000
      )
      camera.position.set(0, 0, 10)

      // parameters
      const baseCell = Math.max(12, Math.min(28, Math.floor(Math.min(width, height) * 0.028)))
      const hexR = baseCell
      const xSpacing = hexR * 1.5
      const ySpacing = Math.sqrt(3) * hexR
      const cols = Math.ceil(width / xSpacing) + 6
      const rows = Math.ceil(height / ySpacing) + 6

      // Build offsets array for staggered hex grid
      const offsets = []
      for (let r = -Math.floor(rows / 2); r < Math.ceil(rows / 2); r++) {
        for (let c = -Math.floor(cols / 2); c < Math.ceil(cols / 2); c++) {
          const px = c * xSpacing + ((r % 2) * 0.75 * hexR)
          const py = r * ySpacing * 0.98
          offsets.push(px, py)
        }
      }
      const instanceCount = offsets.length / 2

      geometry = new THREE.PlaneGeometry(hexR * 2.15, hexR * 2.15)

      // shader material
      const uniforms = {
        time: { value: 0 },
        mouse: { value: new THREE.Vector2(0, 0) },
        resolution: { value: new THREE.Vector2(width, height) },
        gold: { value: new THREE.Color('#D4AF37') },
        baseDark: { value: new THREE.Color('#070006') },
        waveSpeed: { value: 1.0 },
        waveFreq: { value: 0.006 },
        glowIntensity: { value: 1.4 }
      }

      material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms,
        vertexShader: `
          attribute vec2 instanceOffset;
          varying vec2 vUv;
          varying vec2 vWorld;
          void main(){
            vUv = uv;
            vec3 pos = position;
            pos.xy += instanceOffset;
            vWorld = pos.xy;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          precision highp float;
          varying vec2 vUv;
          varying vec2 vWorld;
          uniform float time;
          uniform vec2 mouse;
          uniform vec3 gold;
          uniform vec3 baseDark;
          uniform float waveSpeed;
          uniform float waveFreq;
          uniform float glowIntensity;

          // sdHex from iq adapted
          float sdHex(vec2 p, float r) {
            p = abs(p);
            float k = sqrt(3.0);
            p -= 2.0*min(dot(vec2(k,0.5), p), r) / (k*k + 0.25) * vec2(k,0.5);
            p -= vec2(clamp(p.x, -r, r), r);
            return length(p) * sign(p.y);
          }

          void main(){
            vec2 local = (vUv - 0.5) * 2.0;
            float hexR = 0.92;
            float d = sdHex(local, hexR);
            float mask = smoothstep(0.03, -0.03, d);

            // wave: use world-space distance from a moving line/wave
            float waveCenter = length(vWorld - vec2(mouse.x, mouse.y));
            float wave = sin((waveCenter * waveFreq * 100.0) - time * waveSpeed * 2.0);
            float glow = smoothstep(0.6, -0.6, wave) * 1.2;

            float mDist = length(vWorld - vec2(mouse.x, mouse.y));
            float mPulse = 0.35 / (0.1 + mDist * 0.002);

            float intensity = clamp(glow * mask * glowIntensity + mPulse, 0.0, 1.8);

            vec3 col = mix(baseDark, gold, intensity);
            float rim = smoothstep(0.48, 0.4, abs(d));
            col += gold * rim * 0.06;
            float vign = smoothstep(0.9, 0.1, length(local));
            col *= (0.65 + 0.35 * vign);
            float alpha = mask * (0.95 + 0.05 * intensity);
            gl_FragColor = vec4(col, alpha);
          }
        `
      })

      // Instanced mesh
      const instMeshLocal = new THREE.InstancedMesh(geometry, material, instanceCount)
      // provide instanceOffset attribute
      const offsetAttr = new THREE.InstancedBufferAttribute(new Float32Array(offsets), 2)
      instMeshLocal.geometry.setAttribute('instanceOffset', offsetAttr)

      // assign identity matrices (we don't move via matrix, shader positions each instance)
      const dummy = new THREE.Object3D()
      for (let i = 0; i < instanceCount; i++) {
        dummy.position.set(0, 0, 0)
        dummy.updateMatrix()
        instMeshLocal.setMatrixAt(i, dummy.matrix)
      }
      instMeshLocal.instanceMatrix.needsUpdate = true
      instMeshLocal.frustumCulled = false
      scene.add(instMeshLocal)
      instMesh = instMeshLocal

      // handle mouse -> world coords mapping
      function onPointer(e) {
        const rect = renderer.domElement.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = rect.height / 2 - (e.clientY - rect.top)
        uniforms.mouse.value.set(x, y)
      }
      window.addEventListener('pointermove', onPointer, { passive: true })

      // responsive
      function onResize() {
        const w = container.clientWidth
        const h = container.clientHeight
        renderer.setSize(w, h)
        uniforms.resolution.value.set(w, h)
        camera.left = -w / 2
        camera.right = w / 2
        camera.top = h / 2
        camera.bottom = -h / 2
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      // animation
      const start = performance.now()
      const animate = () => {
        if (!mounted) return
        const t = (performance.now() - start) * 0.001
        uniforms.time.value = t
        renderer.render(scene, camera)
        rafRef.current = requestAnimationFrame(animate)
      }
      rafRef.current = requestAnimationFrame(animate)

      // cleanup handler when unmounting
      return () => {
        mounted = false
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        window.removeEventListener('pointermove', onPointer)
        window.removeEventListener('resize', onResize)
        try {
          if (instMesh) {
            instMesh.geometry.dispose()
            instMesh.material.dispose()
            scene.remove(instMesh)
          }
          if (renderer) {
            renderer.dispose()
            if (renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
          }
        } catch (e) {}
      }
    })()

    // top-level cleanup if effect is torn down
    return () => {
      mounted = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // container fills parent — caller should size it (e.g. h-screen w-full)
  return (
    <div
      ref={mountRef}
      className={"h-full w-full overflow-hidden select-none " + className}
      style={{ touchAction: 'none' }}
    />
  )
}
