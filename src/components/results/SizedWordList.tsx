'use client'

import type { WordFrequency } from '@/lib/utils/word-frequency'

interface SizedWordListProps {
  words: WordFrequency[]
  maxWords?: number
}

export default function SizedWordList({ words, maxWords = 20 }: SizedWordListProps) {
  if (words.length === 0) {
    return <p className="text-sm italic text-muted-foreground">Nincs adat</p>
  }

  const displayed = words.slice(0, maxWords)
  const maxCount = displayed[0].count
  const minCount = displayed[displayed.length - 1].count

  function fontSize(count: number): number {
    if (maxCount === minCount) return 16
    const ratio = (count - minCount) / (maxCount - minCount)
    return 12 + ratio * 14
  }

  function opacity(count: number): number {
    if (maxCount === minCount) return 0.9
    const ratio = (count - minCount) / (maxCount - minCount)
    return 0.5 + ratio * 0.5
  }

  return (
    <div className="flex flex-wrap gap-2" data-chart-id="words">
      {displayed.map((w) => (
        <span
          key={w.word}
          className="inline-block rounded-md bg-surface-high px-2 py-0.5"
          style={{
            fontSize: `${fontSize(w.count)}px`,
            color: '#5c3a1e',
            opacity: opacity(w.count),
          }}
        >
          {w.word}
          {w.count > 1 && (
            <span className="ml-1 text-[10px] text-muted-foreground">({w.count})</span>
          )}
        </span>
      ))}
    </div>
  )
}
