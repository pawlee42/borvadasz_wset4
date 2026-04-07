import { NextResponse } from 'next/server'
import os from 'os'

export function GET() {
  const interfaces = os.networkInterfaces()
  const candidates: string[] = []

  for (const addresses of Object.values(interfaces)) {
    if (!addresses) continue
    for (const addr of addresses) {
      if (addr.family === 'IPv4' && !addr.internal) {
        candidates.push(addr.address)
      }
    }
  }

  // Prefer 192.168.x.x (typical LAN/WiFi) over virtual adapters like 172.x
  const lanIp = candidates.find((ip) => ip.startsWith('192.168.'))
    ?? candidates.find((ip) => ip.startsWith('10.'))
    ?? candidates[0]
    ?? null

  return NextResponse.json({ ip: lanIp })
}
