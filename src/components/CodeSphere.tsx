import { useEffect, useRef } from 'react'

/** A batched canvas wireframe: no external 3D runtime or image requests. */
export function CodeSphere({
  label,
  caption,
}: {
  label: string
  caption: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    if (!canvas || !root) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let width = 0
    let height = 0
    let visible = true
    let pointerX = 0
    let pointerY = 0
    let currentX = 0
    let currentY = 0
    let angle = 0.45
    let previous = 0
    let elapsed = 0
    const geometry: number[][] = []
    const segments: [number, number][] = []
    const latitudeCount = 34
    const longitudeCount = 72

    for (let row = 0; row <= latitudeCount; row++) {
      const latitude = (Math.PI * row) / latitudeCount
      for (let column = 0; column < longitudeCount; column++) {
        const longitude = (Math.PI * 2 * column) / longitudeCount
        const radius =
          1 + 0.035 * Math.cos(longitude * 6) * Math.sin(latitude) ** 3
        geometry.push([
          radius * Math.sin(latitude) * Math.cos(longitude),
          radius * Math.cos(latitude),
          radius * Math.sin(latitude) * Math.sin(longitude),
        ])
        const index = row * longitudeCount + column
        if (row > 0 && row < latitudeCount)
          segments.push([
            index,
            row * longitudeCount + ((column + 1) % longitudeCount),
          ])
        if (row < latitudeCount && column % 2 === 0)
          segments.push([index, index + longitudeCount])
      }
    }
    const projected = geometry.map(() => [0, 0, 0])

    const draw = () => {
      if (width === 0 || height === 0) return
      ctx.clearRect(0, 0, width, height)
      currentX += (pointerX - currentX) * 0.045
      currentY += (pointerY - currentY) * 0.045
      const rotation = angle + currentX * 0.3
      const tilt = -0.28 + currentY * 0.22
      const cosR = Math.cos(rotation),
        sinR = Math.sin(rotation)
      const cosT = Math.cos(tilt),
        sinT = Math.sin(tilt)
      const scale = Math.min(width, height) * 0.35
      const centerX = width * 0.5,
        centerY = height * 0.49

      geometry.forEach(([x, y, z], index) => {
        const rx = x * cosR - z * sinR
        const rz = x * sinR + z * cosR
        const ry = y * cosT - rz * sinT
        const depth = y * sinT + rz * cosT
        const perspective = 3.8 / (3.8 - depth)
        projected[index][0] = centerX + rx * scale * perspective
        projected[index][1] = centerY + ry * scale * perspective
        projected[index][2] = depth
      })
      // Bucket edges by depth so thousands of lines require only eight strokes.
      for (let bucket = 0; bucket < 8; bucket++) {
        ctx.beginPath()
        for (const [a, b] of segments) {
          const pa = projected[a],
            pb = projected[b]
          const depth = (pa[2] + pb[2]) / 2
          const level = Math.max(
            0,
            Math.min(7, Math.floor(((depth + 1.06) / 2.12) * 8)),
          )
          if (level !== bucket) continue
          ctx.moveTo(pa[0], pa[1])
          ctx.lineTo(pb[0], pb[1])
        }
        ctx.strokeStyle = `rgba(180,245,144,${0.045 + (bucket / 7) ** 2 * 0.45})`
        ctx.lineWidth = bucket > 5 ? 0.7 : 0.55
        ctx.stroke()
      }
      // A handful of bright nodes create the impression of a living system.
      for (let i = 0; i < 7; i++) {
        const p = projected[(i * 331 + 490) % projected.length]
        if (p[2] < 0.15) continue
        ctx.beginPath()
        ctx.arc(p[0], p[1], 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(202,255,178,0.85)'
        ctx.fill()
      }
    }
    const tick = (time: number) => {
      const delta = previous ? Math.min(time - previous, 50) : 16
      previous = time
      elapsed += delta
      if (elapsed >= 30) {
        angle += elapsed * 0.000065
        elapsed = 0
        draw()
      }
      if (visible && !document.hidden && !reducedMotion.matches)
        frame = requestAnimationFrame(tick)
    }
    const start = () => {
      cancelAnimationFrame(frame)
      previous = 0
      draw()
      if (visible && !document.hidden && !reducedMotion.matches)
        frame = requestAnimationFrame(tick)
    }
    const resize = new ResizeObserver((entries) => {
      const box = entries[0].contentRect
      width = box.width
      height = box.height
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      draw()
    })
    resize.observe(root)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      start()
    })
    intersection.observe(root)
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || reducedMotion.matches) return
      const box = root.getBoundingClientRect()
      pointerX = (event.clientX - box.left) / box.width - 0.5
      pointerY = (event.clientY - box.top) / box.height - 0.5
    }
    const onLeave = () => {
      pointerX = 0
      pointerY = 0
    }
    root.addEventListener('pointermove', onPointer)
    root.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', start)
    reducedMotion.addEventListener('change', start)
    start()
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      intersection.disconnect()
      root.removeEventListener('pointermove', onPointer)
      root.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', start)
      reducedMotion.removeEventListener('change', start)
    }
  }, [])

  return (
    <div className="sphere-scene" ref={rootRef}>
      <div className="sphere-halo" />
      <span className="scene-coordinate coordinate-top">
        FIG. 001 / THE BUILDER
      </span>
      <span className="scene-cross cross-one">+</span>
      <span className="scene-cross cross-two">+</span>
      <div className="sphere-orbit orbit-one" />
      <div className="sphere-orbit orbit-two" />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="缓慢旋转的薄荷绿色三维线框球体，象征代码与无限可能"
      />
      <div className="sphere-core">
        <span>&lt;</span>
        <b>/</b>
        <span>&gt;</span>
      </div>
      <span className="sphere-label label-one">
        <i />
        {label}
      </span>
      <span className="sphere-label label-two">
        <i />
        IDEAS → REALITY
      </span>
      <div className="scene-bottom">
        <span>
          <i /> ALWAYS EXPLORING
        </span>
        <span>{caption}</span>
      </div>
    </div>
  )
}
