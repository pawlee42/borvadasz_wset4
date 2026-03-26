'use client'

import { toPng } from 'html-to-image'

export async function captureChartImages(
  containerId: string
): Promise<{ [key: string]: string }> {
  const container = document.getElementById(containerId)
  if (!container) return {}

  const chartElements = container.querySelectorAll<HTMLElement>('[data-chart-id]')
  const images: { [key: string]: string } = {}

  for (const el of chartElements) {
    const chartId = el.getAttribute('data-chart-id')
    if (!chartId) continue

    try {
      const dataUrl = await toPng(el, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      })
      images[chartId] = dataUrl
    } catch (err) {
      console.error(`Diagram rögzítése sikertelen (${chartId}):`, err)
    }
  }

  return images
}

interface OffScreenCaptureProps {
  children: React.ReactNode
  id: string
}

export function OffScreenCapture({ children, id }: OffScreenCaptureProps) {
  return (
    <div
      id={id}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: 900,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}
