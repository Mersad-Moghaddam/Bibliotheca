import { MoreHorizontal } from 'lucide-react'
import { ReactNode, useEffect, useRef, useState } from 'react'

import { cn } from '../../lib/cn'

import { Button } from './button'

export type ItemAction = {
  key: string
  label: string
  icon?: ReactNode
  onSelect: () => void | Promise<void>
  destructive?: boolean
  disabled?: boolean
}

export function ItemActionsMenu({
  actions,
  align = 'end',
  label = 'Item actions',
  className
}: {
  actions: ItemAction[]
  align?: 'start' | 'end'
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <Button
        size="sm"
        variant="ghost"
        className="h-9 w-9 rounded-lg p-0"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((prev) => !prev)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      <div
        role="menu"
        className={cn(
          'absolute top-full z-40 mt-1.5 min-w-44 origin-top rounded-xl border border-border/90 bg-card p-1.5 shadow-lg transition duration-150',
          align === 'end' ? 'right-0' : 'left-0',
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'
        )}
      >
        {actions.map((action) => (
          <button
            key={action.key}
            role="menuitem"
            disabled={action.disabled}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none',
              action.destructive
                ? 'text-destructive hover:bg-destructive/10'
                : 'text-foreground hover:bg-surface',
              action.disabled && 'cursor-not-allowed opacity-60'
            )}
            onClick={() => {
              setOpen(false)
              void action.onSelect()
            }}
          >
            {action.icon ? <span className="text-mutedForeground">{action.icon}</span> : null}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
