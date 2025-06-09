export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_jobs: {
        Row: {
          actual_card_count: number
          created_at: string
          deck_id: string
          finished_at: string | null
          id: string
          input_text: string
          requested_card_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["ai_job_status"]
          tokens_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_card_count?: number
          created_at?: string
          deck_id: string
          finished_at?: string | null
          id?: string
          input_text: string
          requested_card_count: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["ai_job_status"]
          tokens_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_card_count?: number
          created_at?: string
          deck_id?: string
          finished_at?: string | null
          id?: string
          input_text?: string
          requested_card_count?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["ai_job_status"]
          tokens_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_jobs_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_metrics: {
        Row: {
          latency_ms: number
          outcome: Database["public"]["Enums"]["ai_job_status"]
          recorded_at: string
          request_id: string
        }
        Insert: {
          latency_ms: number
          outcome: Database["public"]["Enums"]["ai_job_status"]
          recorded_at?: string
          request_id: string
        }
        Update: {
          latency_ms?: number
          outcome?: Database["public"]["Enums"]["ai_job_status"]
          recorded_at?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_metrics_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "ai_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          answer: string
          created_at: string
          deck_id: string
          id: string
          job_id: string | null
          question: string
          review_finished_at: string | null
          review_started_at: string | null
          source_fragment: string | null
          status: Database["public"]["Enums"]["card_status"]
          time_spent: unknown | null
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          deck_id: string
          id?: string
          job_id?: string | null
          question: string
          review_finished_at?: string | null
          review_started_at?: string | null
          source_fragment?: string | null
          status?: Database["public"]["Enums"]["card_status"]
          time_spent?: unknown | null
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          deck_id?: string
          id?: string
          job_id?: string | null
          question?: string
          review_finished_at?: string | null
          review_started_at?: string | null
          source_fragment?: string | null
          status?: Database["public"]["Enums"]["card_status"]
          time_spent?: unknown | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "ai_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      deck_categories: {
        Row: {
          category_id: string
          deck_id: string
        }
        Insert: {
          category_id: string
          deck_id: string
        }
        Update: {
          category_id?: string
          deck_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deck_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_categories_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      decks: {
        Row: {
          card_limit: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_limit?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_limit?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      token_usage: {
        Row: {
          tokens_used: number
          usage_date: string
          user_id: string
        }
        Insert: {
          tokens_used?: number
          usage_date: string
          user_id: string
        }
        Update: {
          tokens_used?: number
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ai_job_status: "pending" | "running" | "succeeded" | "failed"
      card_status: "pending" | "accepted" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      ai_job_status: ["pending", "running", "succeeded", "failed"],
      card_status: ["pending", "accepted", "rejected"],
    },
  },
} as const

