'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Wine } from '@/lib/types/database'

export function useRealtimeWine(sessionId: string) {
  const [wines, setWines] = useState<Wine[]>([])
  const [activeWine, setActiveWine] = useState<Wine | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchWines() {
      const { data } = await supabase
        .from('wines')
        .select('*')
        .eq('session_id', sessionId)
        .order('sort_order')
      if (data) {
        setWines(data)
        setActiveWine(data.find((w) => w.is_active) ?? null)
      }
    }

    fetchWines()

    const channel = supabase
      .channel(`wines-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wines',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setWines((prev) => {
            const updated = payload.new as Wine
            const exists = prev.findIndex((w) => w.id === updated.id)
            let next: Wine[]
            if (payload.eventType === 'DELETE') {
              next = prev.filter((w) => w.id !== (payload.old as Wine).id)
            } else if (exists >= 0) {
              next = prev.map((w) => (w.id === updated.id ? updated : w))
            } else {
              next = [...prev, updated].sort((a, b) => a.sort_order - b.sort_order)
            }
            setActiveWine(next.find((w) => w.is_active) ?? null)
            return next
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  return { activeWine, wines }
}
