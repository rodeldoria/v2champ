export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cached_players: {
        Row: {
          id: string
          first_name: string
          last_name: string
          team: string | null
          position: string | null
          age: number | null
          metadata: Json | null
          last_sync: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          team?: string | null
          position?: string | null
          age?: number | null
          metadata?: Json | null
          last_sync?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          team?: string | null
          position?: string | null
          age?: number | null
          metadata?: Json | null
          last_sync?: string
          created_at?: string
          updated_at?: string
        }
      }
      cached_player_stats: {
        Row: {
          id: string
          player_id: string
          season: string
          week: number
          stats: Json | null
          last_sync: string
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          season: string
          week: number
          stats?: Json | null
          last_sync?: string
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          season?: string
          week?: number
          stats?: Json | null
          last_sync?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}