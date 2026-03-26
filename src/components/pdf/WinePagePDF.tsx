'use client'

import {
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Wine } from '@/lib/types/database'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#faf7f4',
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#5c3a1e',
    borderRadius: 6,
    padding: 16,
    alignItems: 'center',
  },
  wineImage: {
    width: 50,
    height: 75,
    borderRadius: 4,
    marginRight: 16,
    objectFit: 'cover',
  },
  imagePlaceholder: {
    width: 50,
    height: 75,
    borderRadius: 4,
    marginRight: 16,
    backgroundColor: '#8b5e3c',
  },
  headerText: {
    flex: 1,
  },
  producer: {
    fontSize: 9,
    color: '#d6d3d1',
    marginBottom: 2,
  },
  wineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  wineDetails: {
    fontSize: 10,
    color: '#d6d3d1',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  section: {
    width: '48%',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#5c3a1e',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d6d3d1',
    paddingBottom: 4,
  },
  chartImage: {
    width: '100%',
    objectFit: 'contain',
  },
})

interface WinePagePDFProps {
  wine: Wine
  chartImages: { [key: string]: string }
}

const SECTIONS: { title: string; chartKeys: string[] }[] = [
  {
    title: 'Megjelenés',
    chartKeys: ['dotstrip-Színintenzitás', 'dist-Tisztaság', 'dist-Szín'],
  },
  {
    title: 'Illat',
    chartKeys: ['dotstrip-Illatintenzitás', 'dist-Állapot', 'dist-Fejlettség', 'words'],
  },
  {
    title: 'Ízlelés',
    chartKeys: [
      'dotstrip-Édesség',
      'dotstrip-Savasság',
      'dotstrip-Tannin',
      'dotstrip-Alkohol',
      'dotstrip-Test',
      'dotstrip-Ízintenzitás',
      'finish',
    ],
  },
  {
    title: 'Következtetések',
    chartKeys: ['quality', 'dist-Érettség'],
  },
]

export default function WinePagePDF({ wine, chartImages }: WinePagePDFProps) {
  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        {wine.image_url ? (
          <Image src={wine.image_url} style={styles.wineImage} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        <View style={styles.headerText}>
          <Text style={styles.producer}>{wine.producer}</Text>
          <Text style={styles.wineName}>{wine.name}</Text>
          <Text style={styles.wineDetails}>
            {wine.vintage ? `${wine.vintage} ` : ''}
            {wine.region ? `- ${wine.region}` : ''}
          </Text>
        </View>
      </View>

      {/* Radar + overview */}
      {chartImages['radar'] && (
        <View style={{ marginBottom: 12 }}>
          <Image src={chartImages['radar']} style={{ width: 250, height: 200, alignSelf: 'center' }} />
        </View>
      )}

      {/* Sections grid */}
      <View style={styles.grid}>
        {SECTIONS.map((section) => {
          const availableImages = section.chartKeys.filter(
            (k) => chartImages[k]
          )
          if (availableImages.length === 0) return null

          return (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {availableImages.map((key) => (
                <Image
                  key={key}
                  src={chartImages[key]}
                  style={[styles.chartImage, { marginBottom: 6 }]}
                />
              ))}
            </View>
          )
        })}
      </View>
    </Page>
  )
}
