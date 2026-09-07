import { useEffect, useRef, useState } from 'react'

export function Reveal({ children, className = '', delay = 0, stagger = false }: { children: React.ReactNode; className?: string; delay?: number; stagger?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect() }
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${stagger ? 'stagger' : 'reveal'} ${visible ? 'in' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } as React.CSSProperties : undefined}
    >
      {children}
    </div>
  )
}
