import { useEffect, useRef } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export function usePageMotion() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px 35px 0px' },
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])
}

interface TiltCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  intensity?: number
  style?: CSSProperties
}

export function TiltCard({
  children,
  className = '',
  intensity = 5,
  style,
  ...props
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const enabled = useRef(false)

  useEffect(() => {
    const media = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    )
    const update = () => {
      enabled.current = media.matches
    }
    update()
    media.addEventListener('change', update)
    return () => {
      media.removeEventListener('change', update)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      style={style}
      onPointerMove={(event) => {
        if (!enabled.current || !ref.current) return
        const box = event.currentTarget.getBoundingClientRect()
        const x = (event.clientX - box.left) / box.width
        const y = (event.clientY - box.top) / box.height
        cancelAnimationFrame(frame.current)
        frame.current = requestAnimationFrame(() => {
          if (!ref.current) return
          ref.current.style.setProperty(
            '--rotate-x',
            `${(0.5 - y) * intensity}deg`,
          )
          ref.current.style.setProperty(
            '--rotate-y',
            `${(x - 0.5) * intensity}deg`,
          )
          ref.current.style.setProperty('--mouse-x', `${x * 100}%`)
          ref.current.style.setProperty('--mouse-y', `${y * 100}%`)
        })
      }}
      onPointerLeave={() => {
        cancelAnimationFrame(frame.current)
        if (!ref.current) return
        ref.current.style.setProperty('--rotate-x', '0deg')
        ref.current.style.setProperty('--rotate-y', '0deg')
      }}
      {...props}
    >
      {children}
    </div>
  )
}
