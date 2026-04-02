'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { AROMA_GROUPS } from '@/lib/constants/aromas'

interface AromaSelectorProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function parseSelected(value: string): Set<string> {
  if (!value.trim()) return new Set()
  return new Set(value.split(',').map((s) => s.trim()).filter(Boolean))
}

function serializeSelected(selected: Set<string>): string {
  return Array.from(selected).join(', ')
}

export function AromaSelector({ label, value, onChange }: AromaSelectorProps) {
  const selected = parseSelected(value)
  const [openGroup, setOpenGroup] = useState<number | null>(null)

  function toggle(item: string) {
    const next = new Set(selected)
    if (next.has(item)) {
      next.delete(item)
    } else {
      next.add(item)
    }
    onChange(serializeSelected(next))
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>

      {selected.size > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Array.from(selected).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className="rounded-none bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              {item} ×
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1">
        {AROMA_GROUPS.map((group, gi) => (
          <div key={group.title} className="rounded-lg bg-surface-low overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenGroup(openGroup === gi ? null : gi)}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide transition-colors',
                openGroup === gi
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-secondary/50'
              )}
            >
              {group.title}
              <span className="text-[10px]">{openGroup === gi ? '▲' : '▼'}</span>
            </button>

            {openGroup === gi && (
              <div className="px-3 py-2 space-y-3 bg-background">
                {group.categories.map((cat) => (
                  <div key={cat.name}>
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">{cat.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((item) => {
                        const isSelected = selected.has(item)
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggle(item)}
                            className={cn(
                              'rounded-none px-3 py-1 text-xs font-medium transition-colors',
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-surface-high text-foreground/70 hover:bg-surface-high/70'
                            )}
                          >
                            {item}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
