import { ReactNode, useMemo, useRef, useState } from 'react'

import { cn } from '../../lib/cn'

type SwipeAction = {
  label: string
  onAction: () => void | Promise<void>
  tone?: 'default' | 'success'
}

export function SwipeableCardShell({
  children,
  startAction,
  endAction,
  className,
  hint
}: {
  children: ReactNode
  startAction?: SwipeAction
  endAction?: SwipeAction
  className?: string
  hint?: string
}) {
  const [dragX, setDragX] = useState(0)
  const [activeSide, setActiveSide] = useState<'start' | 'end' | null>(null)
  const startXRef = useRef(0)
  const draggingRef = useRef(false)

  const isRtl = useMemo(() => document.documentElement.dir === 'rtl', [])

  const normalizedX = isRtl ? -dragX : dragX

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return
    startXRef.current = event.clientX
    draggingRef.current = true
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    const delta = event.clientX - startXRef.current
    if (Math.abs(delta) < 8) return
    setDragX(Math.max(-90, Math.min(90, delta)))
    setActiveSide(delta > 0 ? 'start' : 'end')
  }

  const onPointerUp = async () => {
    if (!draggingRef.current) return
    draggingRef.current = false

    const shouldRun = Math.abs(dragX) > 72
    const side = activeSide
    setDragX(0)
    setActiveSide(null)

    if (!shouldRun || !side) return
    if (side === 'start' && startAction) {
      await startAction.onAction()
    }
    if (side === 'end' && endAction) {
      await endAction.onAction()
    }
  }

  const visibleAction = normalizedX > 0 ? startAction : normalizedX < 0 ? endAction : null

  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl', className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => void onPointerUp()}
      onPointerCancel={() => {
        draggingRef.current = false
        setDragX(0)
        setActiveSide(null)
      }}
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 flex items-center px-4 text-xs font-medium transition-opacity',
          visibleAction ? 'opacity-100' : 'opacity-0',
          normalizedX > 0 ? 'justify-start' : 'justify-end',
          visibleAction?.tone === 'success' ? 'bg-success/15 text-success' : 'bg-primary/12 text-primary'
        )}
      >
        <span>{visibleAction?.label}</span>
      </div>
      <div
        className="relative will-change-transform"
        style={{ transform: `translateX(${dragX}px)`, transition: draggingRef.current ? 'none' : 'transform 180ms ease' }}
      >
        {children}
        {hint ? (
          <p className="px-3 pb-2 text-[11px] text-mutedForeground md:hidden">{hint}</p>
        ) : null}
      </div>
    </div>
  )
}
