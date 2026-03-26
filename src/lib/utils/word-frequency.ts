export interface WordFrequency {
  word: string
  count: number
}

export function computeWordFrequency(texts: string[]): WordFrequency[] {
  const freq = new Map<string, number>()

  for (const text of texts) {
    if (!text.trim()) continue
    const words = text
      .toLowerCase()
      .split(/[,;.\n]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 1)

    for (const word of words) {
      freq.set(word, (freq.get(word) || 0) + 1)
    }
  }

  return Array.from(freq.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
}
