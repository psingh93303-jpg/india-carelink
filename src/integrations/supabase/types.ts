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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      departments: {
        Row: {
          created_at: string
          description: string
          display_order: number
          head_doctor: string
          hospital_id: string
          id: string
          name: string
          name_hi: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          head_doctor?: string
          hospital_id: string
          id?: string
          name: string
          name_hi?: string | null
          phone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          head_doctor?: string
          hospital_id?: string
          id?: string
          name?: string
          name_hi?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          consultation_hours: string
          created_at: string
          department_id: string | null
          display_order: number
          email: string
          hospital_id: string
          id: string
          name: string
          name_hi: string | null
          phone: string
          photo_url: string
          qualification: string
          specialty: string
          updated_at: string
        }
        Insert: {
          consultation_hours?: string
          created_at?: string
          department_id?: string | null
          display_order?: number
          email?: string
          hospital_id: string
          id?: string
          name: string
          name_hi?: string | null
          phone?: string
          photo_url?: string
          qualification?: string
          specialty?: string
          updated_at?: string
        }
        Update: {
          consultation_hours?: string
          created_at?: string
          department_id?: string | null
          display_order?: number
          email?: string
          hospital_id?: string
          id?: string
          name?: string
          name_hi?: string | null
          phone?: string
          photo_url?: string
          qualification?: string
          specialty?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_staff: {
        Row: {
          created_at: string
          display_order: number
          email: string
          hospital_id: string
          id: string
          name: string
          phone: string
          role_title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          email?: string
          hospital_id: string
          id?: string
          name: string
          phone?: string
          role_title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          email?: string
          hospital_id?: string
          id?: string
          name?: string
          phone?: string
          role_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_staff_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          about: string
          address: string
          ambulance: boolean
          city: string
          city_hi: string | null
          created_at: string
          emergency: boolean
          featured: boolean
          icu: boolean
          id: string
          image: string
          lat: number
          lng: number
          name: string
          name_hi: string | null
          open_24_7: boolean
          phone: string
          rating: number
          reviews_count: number
          specialties: string[]
          updated_at: string
        }
        Insert: {
          about?: string
          address: string
          ambulance?: boolean
          city: string
          city_hi?: string | null
          created_at?: string
          emergency?: boolean
          featured?: boolean
          icu?: boolean
          id?: string
          image?: string
          lat: number
          lng: number
          name: string
          name_hi?: string | null
          open_24_7?: boolean
          phone: string
          rating?: number
          reviews_count?: number
          specialties?: string[]
          updated_at?: string
        }
        Update: {
          about?: string
          address?: string
          ambulance?: boolean
          city?: string
          city_hi?: string | null
          created_at?: string
          emergency?: boolean
          featured?: boolean
          icu?: boolean
          id?: string
          image?: string
          lat?: number
          lng?: number
          name?: string
          name_hi?: string | null
          open_24_7?: boolean
          phone?: string
          rating?: number
          reviews_count?: number
          specialties?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      pathology_labs: {
        Row: {
          about: string
          accreditation: string
          address: string
          city: string
          city_hi: string | null
          created_at: string
          email: string
          featured: boolean
          home_collection: boolean
          id: string
          image: string
          lat: number
          lng: number
          name: string
          name_hi: string | null
          open_24_7: boolean
          phone: string
          rating: number
          tests: string[]
          updated_at: string
        }
        Insert: {
          about?: string
          accreditation?: string
          address: string
          city: string
          city_hi?: string | null
          created_at?: string
          email?: string
          featured?: boolean
          home_collection?: boolean
          id?: string
          image?: string
          lat: number
          lng: number
          name: string
          name_hi?: string | null
          open_24_7?: boolean
          phone?: string
          rating?: number
          tests?: string[]
          updated_at?: string
        }
        Update: {
          about?: string
          accreditation?: string
          address?: string
          city?: string
          city_hi?: string | null
          created_at?: string
          email?: string
          featured?: boolean
          home_collection?: boolean
          id?: string
          image?: string
          lat?: number
          lng?: number
          name?: string
          name_hi?: string | null
          open_24_7?: boolean
          phone?: string
          rating?: number
          tests?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          hospital_id: string
          id: string
          rating: number
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          hospital_id: string
          id?: string
          rating: number
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          hospital_id?: string
          id?: string
          rating?: number
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          brand_name: string
          brand_name_hi: string
          contact_address: string
          contact_email: string
          contact_intro_en: string
          contact_intro_hi: string
          contact_phone: string
          created_at: string
          current_version: string
          disclaimer_en: string
          disclaimer_hi: string
          footer_links: Json
          id: string
          social_links: Json
          tagline_en: string
          tagline_hi: string
          updated_at: string
          whats_new_en: string
          whats_new_hi: string
        }
        Insert: {
          brand_name?: string
          brand_name_hi?: string
          contact_address?: string
          contact_email?: string
          contact_intro_en?: string
          contact_intro_hi?: string
          contact_phone?: string
          created_at?: string
          current_version?: string
          disclaimer_en?: string
          disclaimer_hi?: string
          footer_links?: Json
          id?: string
          social_links?: Json
          tagline_en?: string
          tagline_hi?: string
          updated_at?: string
          whats_new_en?: string
          whats_new_hi?: string
        }
        Update: {
          brand_name?: string
          brand_name_hi?: string
          contact_address?: string
          contact_email?: string
          contact_intro_en?: string
          contact_intro_hi?: string
          contact_phone?: string
          created_at?: string
          current_version?: string
          disclaimer_en?: string
          disclaimer_hi?: string
          footer_links?: Json
          id?: string
          social_links?: Json
          tagline_en?: string
          tagline_hi?: string
          updated_at?: string
          whats_new_en?: string
          whats_new_hi?: string
        }
        Relationships: []
      }
      trusted_links: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string
          description_hi: string
          display_order: number
          id: string
          title: string
          title_hi: string | null
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string
          description_hi?: string
          display_order?: number
          id?: string
          title: string
          title_hi?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string
          description_hi?: string
          display_order?: number
          id?: string
          title?: string
          title_hi?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      version_history: {
        Row: {
          created_at: string
          id: string
          notes_en: string
          notes_hi: string
          released_at: string
          version: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes_en?: string
          notes_hi?: string
          released_at?: string
          version: string
        }
        Update: {
          created_at?: string
          id?: string
          notes_en?: string
          notes_hi?: string
          released_at?: string
          version?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_hospital: { Args: { _user_id: string }; Returns: boolean }
      get_reviewer_names: {
        Args: { _user_ids: string[] }
        Returns: {
          display_name: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "manager"
        | "hospital_manager"
        | "financial_manager"
      review_status: "pending" | "approved" | "rejected"
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
      app_role: [
        "admin",
        "user",
        "manager",
        "hospital_manager",
        "financial_manager",
      ],
      review_status: ["pending", "approved", "rejected"],
    },
  },
} as const
