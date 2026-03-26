'use client'

import { useState, useCallback, useEffect } from 'react'

interface SessionData {
  participantId: string | null
  isLeader: boolean
}

export function useSession(code: string) {
  const [session, setSessionState] = useState<SessionData>({
    participantId: null,
    isLeader: false,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const participantId = localStorage.getItem(`bv_participant_${code}`)
    const isLeader = localStorage.getItem(`bv_leader_${code}`) === 'true'

    setSessionState({ participantId, isLeader })
  }, [code])

  const setSession = useCallback(
    (participantId: string, isLeader: boolean) => {
      localStorage.setItem(`bv_participant_${code}`, participantId)
      localStorage.setItem(`bv_leader_${code}`, String(isLeader))
      setSessionState({ participantId, isLeader })
    },
    [code]
  )

  return { ...session, setSession }
}
