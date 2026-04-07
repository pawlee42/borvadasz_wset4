'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface QRCheckinProps {
  code: string
}

export function QRCheckin({ code }: QRCheckinProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [networkIp, setNetworkIp] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/network-ip')
      .then((r) => r.json())
      .then((d) => { if (d.ip) setNetworkIp(d.ip) })
  }, [])

  const port = typeof window !== 'undefined' ? window.location.port : '3000'
  const joinUrl = networkIp
    ? `http://${networkIp}${port ? `:${port}` : ''}/session/${code}/join`
    : null

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>QR-kód a csatlakozáshoz</span>
        <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-6">
          {joinUrl ? (
            <>
              <QRCodeSVG
                value={joinUrl}
                size={200}
                level="M"
                bgColor="#ffffff"
                fgColor="#420b15"
              />
              <p className="text-xs text-muted-foreground text-center max-w-[200px] break-all">
                {joinUrl}
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Hálózati IP cím nem található
            </p>
          )}
        </div>
      )}
    </div>
  )
}
