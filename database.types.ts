export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      parts: {
        Row: {
          game: string
          game_id: string
          id: string
          lookup_category: string
          name: string
          subcategory: string | null
        }
        Insert: {
          game?: string
          game_id: string
          id?: string
          lookup_category: string
          name: string
          subcategory?: string | null
        }
        Update: {
          game?: string
          game_id?: string
          id?: string
          lookup_category?: string
          name?: string
          subcategory?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          discord_id: string | null
          discord_username: string | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          discord_id?: string | null
          discord_username?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          discord_id?: string | null
          discord_username?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      schematic_parts: {
        Row: {
          part_id: string
          schematic_id: string
          slot_name: string
        }
        Insert: {
          part_id: string
          schematic_id: string
          slot_name: string
        }
        Update: {
          part_id?: string
          schematic_id?: string
          slot_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "schematic_parts_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schematic_parts_schematic_id_fkey"
            columns: ["schematic_id"]
            isOneToOne: false
            referencedRelation: "schematics"
            referencedColumns: ["id"]
          },
        ]
      }
      schematic_tunings: {
        Row: {
          schematic_id: string
          tuning_label: string
          tuning_value: number
        }
        Insert: {
          schematic_id: string
          tuning_label: string
          tuning_value: number
        }
        Update: {
          schematic_id?: string
          tuning_label?: string
          tuning_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "schematic_tunings_schematic_id_fkey"
            columns: ["schematic_id"]
            isOneToOne: false
            referencedRelation: "schematics"
            referencedColumns: ["id"]
          },
        ]
      }
      schematics: {
        Row: {
          created_at: string
          description: string | null
          design_name: string
          designer_name: string
          file_path: string
          game: string | null
          id: string
          image_url: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          design_name: string
          designer_name: string
          file_path: string
          game?: string | null
          id?: string
          image_url?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          design_name?: string
          designer_name?: string
          file_path?: string
          game?: string | null
          id?: string
          image_url?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schematics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_schematic_with_details: {
        Args: {
          p_description?: string
          p_design_name: string
          p_designer_name: string
          p_file_path: string
          p_image_url?: string
          // @ts-expect-error generated
          p_parts: Json
          // @ts-expect-error generated
          p_tunings: Json
          p_user_id: string
        }
        Returns: string
      }
      search_schematics: {
        Args: {
          p_leg_types?: string[]
          p_limit?: number
          p_offset?: number
          p_required_part_ids?: string[]
          p_search_tokens?: string[]
          p_sort_by?: string
          p_sort_direction?: string
        }
        Returns: {
          created_at: string
          design_name: string
          designer_name: string
          id: string
          image_url: string
          total_count: number
        }[]
      }
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
