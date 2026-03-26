'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeSubmissions(wineId: string | null, sessionId: string) {
  const [submissionCount, setSubmissionCount] = useState(0)

  useEffect(() => {
    if (!wineId) {
      setSubmissionCount(0)
      return
    }

    const supabase = createClient()

    async function fetchCount() {
      const { count } = await supabase
        .from('evaluations')
        .select('*', { count: 'exact', head: true })
        .eq('wine_id', wineId!)
      setSubmissionCount(count ?? 0)
    }

    fetchCount()

    const channel = supabase
      .channel(`evaluations-${wineId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'evaluations',
          filter: `wine_id=eq.${wineId}`,
        },
        () => {
          setSubmissionCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [wineId, sessionId])

  return { submissionCount }
}
