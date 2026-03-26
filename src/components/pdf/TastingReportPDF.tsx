'use client'

import { Document } from '@react-pdf/renderer'
import type { Wine } from '@/lib/types/database'
import WinePagePDF from '@/components/pdf/WinePagePDF'

interface TastingReportPDFProps {
  wines: {
    wine: Wine
    chartImages: { [key: string]: string }
  }[]
}

export default function TastingReportPDF({ wines }: TastingReportPDFProps) {
  return (
    <Document
      title="Kóstolási jegyzőkönyv"
      author="Borvadász"
    >
      {wines.map(({ wine, chartImages }) => (
        <WinePagePDF key={wine.id} wine={wine} chartImages={chartImages} />
      ))}
    </Document>
  )
}
