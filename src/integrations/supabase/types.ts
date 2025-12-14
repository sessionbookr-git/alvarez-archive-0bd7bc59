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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      guitar_photos: {
        Row: {
          created_at: string
          guitar_id: string
          id: string
          photo_type: string | null
          photo_url: string
        }
        Insert: {
          created_at?: string
          guitar_id: string
          id?: string
          photo_type?: string | null
          photo_url: string
        }
        Update: {
          created_at?: string
          guitar_id?: string
          id?: string
          photo_type?: string | null
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "guitar_photos_guitar_id_fkey"
            columns: ["guitar_id"]
            isOneToOne: false
            referencedRelation: "guitars"
            referencedColumns: ["id"]
          },
        ]
      }
      guitars: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          bridge_style: string | null
          confidence_level: string | null
          created_at: string
          estimated_year: number | null
          id: string
          label_color: string | null
          label_type: string | null
          model_id: string | null
          neck_block_number: string | null
          serial_number: string
          status: string | null
          submission_notes: string | null
          submitted_by_email: string | null
          truss_rod_location: string | null
          tuner_type: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          bridge_style?: string | null
          confidence_level?: string | null
          created_at?: string
          estimated_year?: number | null
          id?: string
          label_color?: string | null
          label_type?: string | null
          model_id?: string | null
          neck_block_number?: string | null
          serial_number: string
          status?: string | null
          submission_notes?: string | null
          submitted_by_email?: string | null
          truss_rod_location?: string | null
          tuner_type?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          bridge_style?: string | null
          confidence_level?: string | null
          created_at?: string
          estimated_year?: number | null
          id?: string
          label_color?: string | null
          label_type?: string | null
          model_id?: string | null
          neck_block_number?: string | null
          serial_number?: string
          status?: string | null
          submission_notes?: string | null
          submitted_by_email?: string | null
          truss_rod_location?: string | null
          tuner_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guitars_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      identifying_features: {
        Row: {
          created_at: string
          description: string | null
          era_end: number | null
          era_start: number | null
          feature_category: string
          feature_name: string
          feature_value: string | null
          id: string
          photo_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          era_end?: number | null
          era_start?: number | null
          feature_category: string
          feature_name: string
          feature_value?: string | null
          id?: string
          photo_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          era_end?: number | null
          era_start?: number | null
          feature_category?: string
          feature_name?: string
          feature_value?: string | null
          id?: string
          photo_url?: string | null
        }
        Relationships: []
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          used_at: string | null
          used_by_email: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          used_at?: string | null
          used_by_email?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          used_at?: string | null
          used_by_email?: string | null
        }
        Relationships: []
      }
      models: {
        Row: {
          body_shape: string | null
          country_of_manufacture: string | null
          created_at: string
          description: string | null
          id: string
          key_features: Json | null
          model_name: string
          production_end_year: number | null
          production_start_year: number | null
          series: string | null
          updated_at: string
        }
        Insert: {
          body_shape?: string | null
          country_of_manufacture?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key_features?: Json | null
          model_name: string
          production_end_year?: number | null
          production_start_year?: number | null
          series?: string | null
          updated_at?: string
        }
        Update: {
          body_shape?: string | null
          country_of_manufacture?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key_features?: Json | null
          model_name?: string
          production_end_year?: number | null
          production_start_year?: number | null
          series?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      serial_patterns: {
        Row: {
          confidence_notes: string | null
          created_at: string
          id: string
          model_id: string | null
          serial_prefix: string | null
          serial_range_end: string | null
          serial_range_start: string | null
          year_range_end: number
          year_range_start: number
        }
        Insert: {
          confidence_notes?: string | null
          created_at?: string
          id?: string
          model_id?: string | null
          serial_prefix?: string | null
          serial_range_end?: string | null
          serial_range_start?: string | null
          year_range_end: number
          year_range_start: number
        }
        Update: {
          confidence_notes?: string | null
          created_at?: string
          id?: string
          model_id?: string | null
          serial_prefix?: string | null
          serial_range_end?: string | null
          serial_range_start?: string | null
          year_range_end?: number
          year_range_start?: number
        }
        Relationships: [
          {
            foreignKeyName: "serial_patterns_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
