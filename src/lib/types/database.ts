import type { SATEvaluation, WineType } from './sat'

export interface Session {
  id: string
  code: string
  leader_name: string
  title: string | null
  event_date: string | null
  location: string | null
  status: 'active' | 'completed' | 'archived'
  created_at: string
}

export interface Wine {
  id: string
  session_id: string
  name: string
  producer: string
  vintage: number | null
  region: string | null
  wine_type: WineType
  image_url: string | null
  sort_order: number
  is_active: boolean
  results_revealed: boolean
  created_at: string
}

export interface Participant {
  id: string
  session_id: string
  name: string
  is_leader: boolean
  joined_at: string
}

export interface Evaluation {
  id: string
  wine_id: string
  participant_id: string
  data: SATEvaluation
  submitted_at: string
}
