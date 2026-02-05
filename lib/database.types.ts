export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      concept_logs: {
        Row: {
          created_at: string | null
          id: string
          is_favorite: boolean | null
          iteration_type: string | null
          originality_confidence: number | null
          prompt: string
          response: string
          tone: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          iteration_type?: string | null
          originality_confidence?: number | null
          prompt: string
          response: string
          tone: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          iteration_type?: string | null
          originality_confidence?: number | null
          prompt?: string
          response?: string
          tone?: string
          user_id?: string | null
        }
        Relationships: []
      }
      creative_briefs: {
        Row: {
          concept_count: number | null
          created_at: string | null
          hybrid_config: Json | null
          id: string
          is_starred: boolean | null
          last_used_at: string | null
          name: string | null
          query: string
          times_used: number | null
          tone: string
          user_id: string | null
        }
        Insert: {
          concept_count?: number | null
          created_at?: string | null
          hybrid_config?: Json | null
          id?: string
          is_starred?: boolean | null
          last_used_at?: string | null
          name?: string | null
          query: string
          times_used?: number | null
          tone: string
          user_id?: string | null
        }
        Update: {
          concept_count?: number | null
          created_at?: string | null
          hybrid_config?: Json | null
          id?: string
          is_starred?: boolean | null
          last_used_at?: string | null
          name?: string | null
          query?: string
          times_used?: number | null
          tone?: string
          user_id?: string | null
        }
        Relationships: []
      }
      drum_entitlements: {
        Row: {
          lesson_credits: number
          updated_at: string
          user_id: string
        }
        Insert: {
          lesson_credits?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          lesson_credits?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      drum_profiles: {
        Row: {
          goal: string | null
          kit: string | null
          level: string | null
          minutes: number | null
          session_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          goal?: string | null
          kit?: string | null
          level?: string | null
          minutes?: number | null
          session_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          goal?: string | null
          kit?: string | null
          level?: string | null
          minutes?: number | null
          session_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      drum_purchases: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          id: string
          lessons: number
          product: string | null
          stripe_payment_intent: string | null
          stripe_session_id: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          lessons: number
          product?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          lessons?: number
          product?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      drum_sessions: {
        Row: {
          created_at: string
          id: string
          log: Json
          plan: Json | null
          ts: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          log: Json
          plan?: Json | null
          ts: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          log?: Json
          plan?: Json | null
          ts?: string
          user_id?: string
        }
        Relationships: []
      }
      drum_lesson_uses: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          created_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string | null
          entry_type: string | null
          id: string
          metadata: Json | null
          project_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          entry_type?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          entry_type?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          percent_complete: number | null
          project_id: string | null
          sort_order: number | null
          status: string | null
          target_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          percent_complete?: number | null
          project_id?: string | null
          sort_order?: number | null
          status?: string | null
          target_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          percent_complete?: number | null
          project_id?: string | null
          sort_order?: number | null
          status?: string | null
          target_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          github_repo: string | null
          id: string
          live_url: string | null
          name: string
          priority: string | null
          screenshot_url: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          github_repo?: string | null
          id?: string
          live_url?: string | null
          name: string
          priority?: string | null
          screenshot_url?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          github_repo?: string | null
          id?: string
          live_url?: string | null
          name?: string
          priority?: string | null
          screenshot_url?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rhetorical_device_usage: {
        Row: {
          device_name: string
          id: string
          last_used: string | null
          usage_count: number | null
        }
        Insert: {
          device_name: string
          id?: string
          last_used?: string | null
          usage_count?: number | null
        }
        Update: {
          device_name?: string
          id?: string
          last_used?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      rhetorical_examples: {
        Row: {
          brand: string | null
          campaign_name: string | null
          category: string | null
          created_at: string | null
          headline: string | null
          id: string
          rationale: string | null
          region: string | null
          strategist: string | null
          tags: string | null
          tone: string | null
          verbal_device: string | null
          visual_device: string | null
          visual_example: string | null
          when_not_to_use: string | null
          when_to_use: string | null
          year: string | null
        }
        Insert: {
          brand?: string | null
          campaign_name?: string | null
          category?: string | null
          created_at?: string | null
          headline?: string | null
          id?: string
          rationale?: string | null
          region?: string | null
          strategist?: string | null
          tags?: string | null
          tone?: string | null
          verbal_device?: string | null
          visual_device?: string | null
          visual_example?: string | null
          when_not_to_use?: string | null
          when_to_use?: string | null
          year?: string | null
        }
        Update: {
          brand?: string | null
          campaign_name?: string | null
          category?: string | null
          created_at?: string | null
          headline?: string | null
          id?: string
          rationale?: string | null
          region?: string | null
          strategist?: string | null
          tags?: string | null
          tone?: string | null
          verbal_device?: string | null
          visual_device?: string | null
          visual_example?: string | null
          when_not_to_use?: string | null
          when_to_use?: string | null
          year?: string | null
        }
        Relationships: []
      }
      salvaged_fragments: {
        Row: {
          concept_id: string | null
          created_at: string | null
          fragment_text: string | null
          fragment_type: string | null
          id: string
          rationale: string | null
          recombined_from: string | null
          usage_count: number | null
        }
        Insert: {
          concept_id?: string | null
          created_at?: string | null
          fragment_text?: string | null
          fragment_type?: string | null
          id?: string
          rationale?: string | null
          recombined_from?: string | null
          usage_count?: number | null
        }
        Update: {
          concept_id?: string | null
          created_at?: string | null
          fragment_text?: string | null
          fragment_type?: string | null
          id?: string
          rationale?: string | null
          recombined_from?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "salvaged_fragments_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "concept_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salvaged_fragments_recombined_from_fkey"
            columns: ["recombined_from"]
            isOneToOne: false
            referencedRelation: "salvaged_fragments"
            referencedColumns: ["id"]
          },
        ]
      }
      site_visits: {
        Row: {
          count: number | null
          site: string
          updated_at: string | null
        }
        Insert: {
          count?: number | null
          site: string
          updated_at?: string | null
        }
        Update: {
          count?: number | null
          site?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          milestone_id: string | null
          name: string
          sort_order: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          milestone_id?: string | null
          name: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          milestone_id?: string | null
          name?: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      used_examples: {
        Row: {
          created_at: string | null
          example_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          example_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          example_id?: string
          id?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
