import { z } from 'zod'

export const verifyPasswordSchema = z.object({
  password: z.string().min(1),
})

export const createSessionSchema = z.object({
  password: z.string().min(1),
  leaderName: z.string().min(1).max(100).trim(),
  title: z.string().max(200).trim().optional(),
  eventDate: z.string().optional(),
  location: z.string().max(200).trim().optional(),
})

export const joinSessionSchema = z.object({
  name: z.string().min(1).max(100).trim(),
})

export const createWineSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  producer: z.string().min(1).max(200).trim(),
  vintage: z.number().int().min(1900).max(2100).nullable(),
  region: z.string().max(200).trim().nullable(),
  wine_type: z.enum(['white', 'rosé', 'red']),
  image_url: z.string().url().nullable().optional(),
})

export const evaluationSchema = z.object({
  appearance: z.object({
    clarity: z.enum(['clear', 'hazy']),
    intensity: z.number().int().min(0).max(4),
    colour: z.string().min(1),
    observations: z.string().max(500),
  }),
  nose: z.object({
    condition: z.enum(['clean', 'unclean']),
    intensity: z.number().int().min(0).max(4),
    aromaCharacteristics: z.string().max(1000),
    development: z.enum(['youthful', 'developing', 'fully_developed', 'tired']),
  }),
  palate: z.object({
    sweetness: z.number().int().min(0).max(4),
    acidity: z.number().int().min(0).max(4),
    tanninLevel: z.number().int().min(0).max(4).nullable(),
    tanninNature: z.string().max(500).nullable(),
    alcohol: z.number().int().min(0).max(4),
    body: z.number().int().min(0).max(4),
    flavourIntensity: z.number().int().min(0).max(4),
    flavourCharacteristics: z.string().max(1000),
    finishSeconds: z.number().min(0).max(15),
    observations: z.string().max(500),
  }),
  conclusions: z.object({
    quality: z.number().int().min(50).max(100),
    readiness: z.enum(['too_young', 'can_drink_ageing', 'drink_now', 'too_old']),
    explanation: z.string().max(2000),
  }),
})
