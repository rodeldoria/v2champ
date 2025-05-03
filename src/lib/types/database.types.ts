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
          created_by: string | null
          updated_by: string | null
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
          created_by?: string | null
          updated_by?: string | null
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
          created_by?: string | null
          updated_by?: string | null
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
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          player_id: string
          season: string
          week: number
          stats?: Json | null
          last_sync?: string
          created_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          season?: string
          week?: number
          stats?: Json | null
          last_sync?: string
          created_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      player_stats: {
        Row: {
          id: number
          player_id: string
          count: number
          created_at: string | null
        }
        Insert: {
          id?: number
          player_id: string
          count: number
          created_at?: string | null
        }
        Update: {
          id?: number
          player_id?: string
          count?: number
          created_at?: string | null
        }
      }
      player_projections: {
        Row: {
          id: number
          player_id: string | null
          week: number
          season: string
          projections: Json | null
          created_at: string | null
        }
        Insert: {
          id?: number
          player_id?: string | null
          week: number
          season: string
          projections?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: number
          player_id?: string | null
          week?: number
          season?: string
          projections?: Json | null
          created_at?: string | null
        }
      }
      players: {
        Row: {
          id: string
          first_name: string
          last_name: string
          full_name: string
          team: string | null
          position: string | null
          age: number | null
          injury_status: string | null
          fantasy_positions: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          full_name: string
          team?: string | null
          position?: string | null
          age?: number | null
          injury_status?: string | null
          fantasy_positions?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          full_name?: string
          team?: string | null
          position?: string | null
          age?: number | null
          injury_status?: string | null
          fantasy_positions?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      sync_meta: {
        Row: {
          key: string
          value: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          key: string
          value: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          key?: string
          value?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: string
          favorite_teams: Json | null
          favorite_players: Json | null
          notification_settings: Json | null
          created_at: string
          updated_at: string
          onboarding_completed: boolean | null
          username: string | null
          favorite_position: string | null
          experience_level: string | null
          feedback: string | null
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string
          favorite_teams?: Json | null
          favorite_players?: Json | null
          notification_settings?: Json | null
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean | null
          username?: string | null
          favorite_position?: string | null
          experience_level?: string | null
          feedback?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string
          favorite_teams?: Json | null
          favorite_players?: Json | null
          notification_settings?: Json | null
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean | null
          username?: string | null
          favorite_position?: string | null
          experience_level?: string | null
          feedback?: string | null
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
  auth: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          user_metadata: {
            username?: string
            avatar_url?: string
          }
        }
      }
    }
  }
}