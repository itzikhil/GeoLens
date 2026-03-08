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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      actor_relationships: {
        Row: {
          actor_a_id: string
          actor_b_id: string
          confidence_score: number | null
          created_at: string | null
          description: string | null
          id: string
          relationship_type: string
          updated_at: string | null
        }
        Insert: {
          actor_a_id: string
          actor_b_id: string
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          relationship_type: string
          updated_at?: string | null
        }
        Update: {
          actor_a_id?: string
          actor_b_id?: string
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          relationship_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actor_relationships_actor_a_id_fkey"
            columns: ["actor_a_id"]
            isOneToOne: false
            referencedRelation: "actors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actor_relationships_actor_b_id_fkey"
            columns: ["actor_b_id"]
            isOneToOne: false
            referencedRelation: "actors"
            referencedColumns: ["id"]
          },
        ]
      }
      actors: {
        Row: {
          actor_type: Database["public"]["Enums"]["actor_type"]
          country_tags: string[] | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          region_tags: string[] | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          actor_type: Database["public"]["Enums"]["actor_type"]
          country_tags?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          region_tags?: string[] | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          actor_type?: Database["public"]["Enums"]["actor_type"]
          country_tags?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          region_tags?: string[] | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      analyst_notes: {
        Row: {
          actor_id: string | null
          body: string | null
          created_at: string | null
          event_cluster_id: string | null
          id: string
          item_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          created_at?: string | null
          event_cluster_id?: string | null
          id?: string
          item_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          created_at?: string | null
          event_cluster_id?: string | null
          id?: string
          item_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyst_notes_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "actors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analyst_notes_event_cluster_id_fkey"
            columns: ["event_cluster_id"]
            isOneToOne: false
            referencedRelation: "event_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analyst_notes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      event_cluster_items: {
        Row: {
          created_at: string | null
          event_cluster_id: string
          id: string
          item_id: string
          relevance_score: number | null
        }
        Insert: {
          created_at?: string | null
          event_cluster_id: string
          id?: string
          item_id: string
          relevance_score?: number | null
        }
        Update: {
          created_at?: string | null
          event_cluster_id?: string
          id?: string
          item_id?: string
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_cluster_items_event_cluster_id_fkey"
            columns: ["event_cluster_id"]
            isOneToOne: false
            referencedRelation: "event_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_cluster_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      event_clusters: {
        Row: {
          actor_tags: string[] | null
          confidence_score: number | null
          country_tags: string[] | null
          created_at: string | null
          description: string | null
          end_date: string | null
          grouping_rationale: string | null
          id: string
          item_count: number | null
          narrative_comparison: Json | null
          region_tags: string[] | null
          significance_score: number | null
          slug: string
          source_diversity_count: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["cluster_status"] | null
          title: string
          top_actors: string[] | null
          top_countries: string[] | null
          top_topics: string[] | null
          topic_tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          actor_tags?: string[] | null
          confidence_score?: number | null
          country_tags?: string[] | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          grouping_rationale?: string | null
          id?: string
          item_count?: number | null
          narrative_comparison?: Json | null
          region_tags?: string[] | null
          significance_score?: number | null
          slug: string
          source_diversity_count?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["cluster_status"] | null
          title: string
          top_actors?: string[] | null
          top_countries?: string[] | null
          top_topics?: string[] | null
          topic_tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          actor_tags?: string[] | null
          confidence_score?: number | null
          country_tags?: string[] | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          grouping_rationale?: string | null
          id?: string
          item_count?: number | null
          narrative_comparison?: Json | null
          region_tags?: string[] | null
          significance_score?: number | null
          slug?: string
          source_diversity_count?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["cluster_status"] | null
          title?: string
          top_actors?: string[] | null
          top_countries?: string[] | null
          top_topics?: string[] | null
          topic_tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ingestion_jobs: {
        Row: {
          created_at: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          items_fetched: number | null
          items_inserted: number | null
          items_skipped_duplicate: number | null
          job_type: string
          max_retries: number | null
          retry_count: number | null
          source_id: string | null
          started_at: string | null
          stats_json: Json | null
          status: Database["public"]["Enums"]["job_status"] | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          items_fetched?: number | null
          items_inserted?: number | null
          items_skipped_duplicate?: number | null
          job_type: string
          max_retries?: number | null
          retry_count?: number | null
          source_id?: string | null
          started_at?: string | null
          stats_json?: Json | null
          status?: Database["public"]["Enums"]["job_status"] | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          items_fetched?: number | null
          items_inserted?: number | null
          items_skipped_duplicate?: number | null
          job_type?: string
          max_retries?: number | null
          retry_count?: number | null
          source_id?: string | null
          started_at?: string | null
          stats_json?: Json | null
          status?: Database["public"]["Enums"]["job_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      item_narratives: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          item_id: string
          narrative_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          item_id: string
          narrative_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          item_id?: string
          narrative_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_narratives_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_narratives_narrative_id_fkey"
            columns: ["narrative_id"]
            isOneToOne: false
            referencedRelation: "narratives"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          actor_tags: string[] | null
          author: string | null
          content_clean: string | null
          content_raw: string | null
          country_tags: string[] | null
          created_at: string | null
          credibility_score: number | null
          duplicate_of_item_id: string | null
          duration_seconds: number | null
          external_item_id: string | null
          id: string
          importance_score: number | null
          ingestion_status:
            | Database["public"]["Enums"]["ingestion_status"]
            | null
          language: string | null
          media_type: Database["public"]["Enums"]["media_type"] | null
          published_at: string | null
          region_tags: string[] | null
          sentiment_label: string | null
          source_id: string | null
          source_type: Database["public"]["Enums"]["source_type"] | null
          stance_label: string | null
          summary_long: string | null
          summary_short: string | null
          thumbnail_url: string | null
          title: string
          topic_tags: string[] | null
          transcript: string | null
          translated_content: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          actor_tags?: string[] | null
          author?: string | null
          content_clean?: string | null
          content_raw?: string | null
          country_tags?: string[] | null
          created_at?: string | null
          credibility_score?: number | null
          duplicate_of_item_id?: string | null
          duration_seconds?: number | null
          external_item_id?: string | null
          id?: string
          importance_score?: number | null
          ingestion_status?:
            | Database["public"]["Enums"]["ingestion_status"]
            | null
          language?: string | null
          media_type?: Database["public"]["Enums"]["media_type"] | null
          published_at?: string | null
          region_tags?: string[] | null
          sentiment_label?: string | null
          source_id?: string | null
          source_type?: Database["public"]["Enums"]["source_type"] | null
          stance_label?: string | null
          summary_long?: string | null
          summary_short?: string | null
          thumbnail_url?: string | null
          title: string
          topic_tags?: string[] | null
          transcript?: string | null
          translated_content?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          actor_tags?: string[] | null
          author?: string | null
          content_clean?: string | null
          content_raw?: string | null
          country_tags?: string[] | null
          created_at?: string | null
          credibility_score?: number | null
          duplicate_of_item_id?: string | null
          duration_seconds?: number | null
          external_item_id?: string | null
          id?: string
          importance_score?: number | null
          ingestion_status?:
            | Database["public"]["Enums"]["ingestion_status"]
            | null
          language?: string | null
          media_type?: Database["public"]["Enums"]["media_type"] | null
          published_at?: string | null
          region_tags?: string[] | null
          sentiment_label?: string | null
          source_id?: string | null
          source_type?: Database["public"]["Enums"]["source_type"] | null
          stance_label?: string | null
          summary_long?: string | null
          summary_short?: string | null
          thumbnail_url?: string | null
          title?: string
          topic_tags?: string[] | null
          transcript?: string | null
          translated_content?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_duplicate_of_item_id_fkey"
            columns: ["duplicate_of_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      narratives: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          label: string
          region_tags: string[] | null
          topic_tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          label: string
          region_tags?: string[] | null
          topic_tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          label?: string
          region_tags?: string[] | null
          topic_tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sources: {
        Row: {
          base_url: string | null
          bias_label: string | null
          country_tags: string[] | null
          created_at: string | null
          external_id: string | null
          id: string
          ingest_method: string | null
          is_active: boolean | null
          language: string | null
          last_ingested_at: string | null
          last_successful_ingest_at: string | null
          name: string
          notes: string | null
          rate_limit_seconds: number | null
          region_tags: string[] | null
          reliability_score: number | null
          rss_url: string | null
          slug: string
          source_type: Database["public"]["Enums"]["source_type"]
          updated_at: string | null
        }
        Insert: {
          base_url?: string | null
          bias_label?: string | null
          country_tags?: string[] | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          ingest_method?: string | null
          is_active?: boolean | null
          language?: string | null
          last_ingested_at?: string | null
          last_successful_ingest_at?: string | null
          name: string
          notes?: string | null
          rate_limit_seconds?: number | null
          region_tags?: string[] | null
          reliability_score?: number | null
          rss_url?: string | null
          slug: string
          source_type?: Database["public"]["Enums"]["source_type"]
          updated_at?: string | null
        }
        Update: {
          base_url?: string | null
          bias_label?: string | null
          country_tags?: string[] | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          ingest_method?: string | null
          is_active?: boolean | null
          language?: string | null
          last_ingested_at?: string | null
          last_successful_ingest_at?: string | null
          name?: string
          notes?: string | null
          rate_limit_seconds?: number | null
          region_tags?: string[] | null
          reliability_score?: number | null
          rss_url?: string | null
          slug?: string
          source_type?: Database["public"]["Enums"]["source_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      watchlist_entities: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["watchlist_entity_type"]
          id: string
          watchlist_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["watchlist_entity_type"]
          id?: string
          watchlist_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["watchlist_entity_type"]
          id?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_entities_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
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
      actor_type:
        | "country"
        | "government"
        | "military"
        | "company"
        | "militia"
        | "political_figure"
        | "institution"
        | "shipping_actor"
        | "energy_actor"
        | "media_actor"
      app_role: "admin" | "analyst" | "user"
      cluster_status: "emerging" | "active" | "ongoing" | "cooled" | "archived"
      ingestion_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "skipped"
      job_status:
        | "queued"
        | "running"
        | "completed"
        | "partial_success"
        | "failed"
        | "cancelled"
      media_type:
        | "article"
        | "post"
        | "thread"
        | "video"
        | "podcast_episode"
        | "telegram_message"
        | "report"
      source_type:
        | "mainstream"
        | "niche"
        | "think_tank"
        | "government"
        | "x"
        | "telegram"
        | "youtube"
        | "podcast"
        | "rss"
        | "api"
        | "custom"
      watchlist_entity_type:
        | "region"
        | "country"
        | "actor"
        | "topic"
        | "source"
        | "event_cluster"
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
      actor_type: [
        "country",
        "government",
        "military",
        "company",
        "militia",
        "political_figure",
        "institution",
        "shipping_actor",
        "energy_actor",
        "media_actor",
      ],
      app_role: ["admin", "analyst", "user"],
      cluster_status: ["emerging", "active", "ongoing", "cooled", "archived"],
      ingestion_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "skipped",
      ],
      job_status: [
        "queued",
        "running",
        "completed",
        "partial_success",
        "failed",
        "cancelled",
      ],
      media_type: [
        "article",
        "post",
        "thread",
        "video",
        "podcast_episode",
        "telegram_message",
        "report",
      ],
      source_type: [
        "mainstream",
        "niche",
        "think_tank",
        "government",
        "x",
        "telegram",
        "youtube",
        "podcast",
        "rss",
        "api",
        "custom",
      ],
      watchlist_entity_type: [
        "region",
        "country",
        "actor",
        "topic",
        "source",
        "event_cluster",
      ],
    },
  },
} as const
