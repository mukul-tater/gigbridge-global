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
      application_status_history: {
        Row: {
          application_id: string
          changed_by: string
          created_at: string | null
          id: string
          notes: string | null
          status: string
        }
        Insert: {
          application_id: string
          changed_by: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status: string
        }
        Update: {
          application_id?: string
          changed_by?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      background_verifications: {
        Row: {
          completed_at: string | null
          created_at: string | null
          documents_verified: Json | null
          employer_id: string
          id: string
          notes: string | null
          requested_at: string | null
          result: string | null
          status: string
          updated_at: string | null
          verification_type: string
          verified_by: string | null
          worker_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          documents_verified?: Json | null
          employer_id: string
          id?: string
          notes?: string | null
          requested_at?: string | null
          result?: string | null
          status?: string
          updated_at?: string | null
          verification_type: string
          verified_by?: string | null
          worker_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          documents_verified?: Json | null
          employer_id?: string
          id?: string
          notes?: string | null
          requested_at?: string | null
          result?: string | null
          status?: string
          updated_at?: string | null
          verification_type?: string
          verified_by?: string | null
          worker_id?: string
        }
        Relationships: []
      }
      compliance_checks: {
        Row: {
          check_type: string
          created_at: string | null
          entity_id: string
          entity_type: string
          findings: Json | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string | null
          status: string
        }
        Insert: {
          check_type: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          findings?: Json | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          status?: string
        }
        Update: {
          check_type?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          findings?: Json | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          status?: string
        }
        Relationships: []
      }
      content_flags: {
        Row: {
          action_taken: string | null
          content_id: string
          content_type: string
          created_at: string | null
          description: string | null
          flag_reason: string
          flagged_by: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          action_taken?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          description?: string | null
          flag_reason: string
          flagged_by?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          action_taken?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          flag_reason?: string
          flagged_by?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string
          dispute_type: string
          evidence: Json | null
          filed_against: string
          filed_by: string
          id: string
          job_id: string | null
          priority: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description: string
          dispute_type: string
          evidence?: Json | null
          filed_against: string
          filed_by: string
          id?: string
          job_id?: string | null
          priority?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string
          dispute_type?: string
          evidence?: Json | null
          filed_against?: string
          filed_by?: string
          id?: string
          job_id?: string | null
          priority?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_profiles: {
        Row: {
          bio: string | null
          company_name: string | null
          company_registration: string | null
          company_size: string | null
          created_at: string | null
          id: string
          industry: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          company_name?: string | null
          company_registration?: string | null
          company_size?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          company_name?: string | null
          company_registration?: string | null
          company_size?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      interviews: {
        Row: {
          application_id: string
          created_at: string | null
          duration_minutes: number
          employer_id: string
          feedback: string | null
          id: string
          interview_mode: string
          job_id: string
          location: string | null
          meeting_link: string | null
          notes: string | null
          scheduled_date: string
          scheduled_time: string
          status: string
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          application_id: string
          created_at?: string | null
          duration_minutes?: number
          employer_id: string
          feedback?: string | null
          id?: string
          interview_mode?: string
          job_id: string
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: string
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          application_id?: string
          created_at?: string | null
          duration_minutes?: number
          employer_id?: string
          feedback?: string | null
          id?: string
          interview_mode?: string
          job_id?: string
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: string
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applied_at: string | null
          cover_letter: string | null
          employer_id: string
          id: string
          job_id: string
          notes: string | null
          resume_url: string | null
          status: string
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          applied_at?: string | null
          cover_letter?: string | null
          employer_id: string
          id?: string
          job_id: string
          notes?: string | null
          resume_url?: string | null
          status?: string
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          applied_at?: string | null
          cover_letter?: string | null
          employer_id?: string
          id?: string
          job_id?: string
          notes?: string | null
          resume_url?: string | null
          status?: string
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: []
      }
      job_formalities: {
        Row: {
          actual_joining_date: string | null
          application_id: string
          arrival_date: string | null
          completion_percentage: number | null
          contract_sent: boolean | null
          contract_signed: boolean | null
          contract_signed_date: string | null
          contract_url: string | null
          created_at: string | null
          departure_date: string | null
          ecr_certificate_url: string | null
          ecr_check_required: boolean | null
          ecr_check_status: string | null
          ecr_clearance_date: string | null
          expected_joining_date: string | null
          flight_booking_status: string | null
          id: string
          job_id: string
          medical_certificate_url: string | null
          medical_exam_date: string | null
          medical_exam_required: boolean | null
          medical_exam_status: string | null
          notes: string | null
          overall_status: string | null
          police_certificate_url: string | null
          police_verification_date: string | null
          police_verification_required: boolean | null
          police_verification_status: string | null
          travel_details: Json | null
          updated_at: string | null
          visa_application_date: string | null
          visa_approval_date: string | null
          visa_expiry_date: string | null
          visa_required: boolean | null
          visa_status: string | null
          visa_type: string | null
          worker_id: string
        }
        Insert: {
          actual_joining_date?: string | null
          application_id: string
          arrival_date?: string | null
          completion_percentage?: number | null
          contract_sent?: boolean | null
          contract_signed?: boolean | null
          contract_signed_date?: string | null
          contract_url?: string | null
          created_at?: string | null
          departure_date?: string | null
          ecr_certificate_url?: string | null
          ecr_check_required?: boolean | null
          ecr_check_status?: string | null
          ecr_clearance_date?: string | null
          expected_joining_date?: string | null
          flight_booking_status?: string | null
          id?: string
          job_id: string
          medical_certificate_url?: string | null
          medical_exam_date?: string | null
          medical_exam_required?: boolean | null
          medical_exam_status?: string | null
          notes?: string | null
          overall_status?: string | null
          police_certificate_url?: string | null
          police_verification_date?: string | null
          police_verification_required?: boolean | null
          police_verification_status?: string | null
          travel_details?: Json | null
          updated_at?: string | null
          visa_application_date?: string | null
          visa_approval_date?: string | null
          visa_expiry_date?: string | null
          visa_required?: boolean | null
          visa_status?: string | null
          visa_type?: string | null
          worker_id: string
        }
        Update: {
          actual_joining_date?: string | null
          application_id?: string
          arrival_date?: string | null
          completion_percentage?: number | null
          contract_sent?: boolean | null
          contract_signed?: boolean | null
          contract_signed_date?: string | null
          contract_url?: string | null
          created_at?: string | null
          departure_date?: string | null
          ecr_certificate_url?: string | null
          ecr_check_required?: boolean | null
          ecr_check_status?: string | null
          ecr_clearance_date?: string | null
          expected_joining_date?: string | null
          flight_booking_status?: string | null
          id?: string
          job_id?: string
          medical_certificate_url?: string | null
          medical_exam_date?: string | null
          medical_exam_required?: boolean | null
          medical_exam_status?: string | null
          notes?: string | null
          overall_status?: string | null
          police_certificate_url?: string | null
          police_verification_date?: string | null
          police_verification_required?: boolean | null
          police_verification_status?: string | null
          travel_details?: Json | null
          updated_at?: string | null
          visa_application_date?: string | null
          visa_approval_date?: string | null
          visa_expiry_date?: string | null
          visa_required?: boolean | null
          visa_status?: string | null
          visa_type?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_formalities_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_formalities_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_skills: {
        Row: {
          created_at: string | null
          id: string
          job_id: string
          skill_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id: string
          skill_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string
          skill_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string | null
          country: string
          created_at: string | null
          currency: string
          description: string
          employer_id: string
          experience_level: string
          expires_at: string | null
          id: string
          job_type: string
          location: string
          openings: number
          posted_at: string | null
          remote_allowed: boolean | null
          requirements: string | null
          responsibilities: string | null
          salary_max: number | null
          salary_min: number | null
          slug: string | null
          status: string
          title: string
          updated_at: string | null
          visa_sponsorship: boolean | null
        }
        Insert: {
          benefits?: string | null
          country: string
          created_at?: string | null
          currency?: string
          description: string
          employer_id: string
          experience_level: string
          expires_at?: string | null
          id?: string
          job_type: string
          location: string
          openings?: number
          posted_at?: string | null
          remote_allowed?: boolean | null
          requirements?: string | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          slug?: string | null
          status?: string
          title: string
          updated_at?: string | null
          visa_sponsorship?: boolean | null
        }
        Update: {
          benefits?: string | null
          country?: string
          created_at?: string | null
          currency?: string
          description?: string
          employer_id?: string
          experience_level?: string
          expires_at?: string | null
          id?: string
          job_type?: string
          location?: string
          openings?: number
          posted_at?: string | null
          remote_allowed?: boolean | null
          requirements?: string | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          slug?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          visa_sponsorship?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          flagged_reason: string | null
          id: string
          is_flagged: boolean | null
          is_read: boolean | null
          job_id: string | null
          parent_message_id: string | null
          receiver_id: string
          sender_id: string
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          flagged_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_read?: boolean | null
          job_id?: string | null
          parent_message_id?: string | null
          receiver_id: string
          sender_id: string
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          flagged_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_read?: boolean | null
          job_id?: string | null
          parent_message_id?: string | null
          receiver_id?: string
          sender_id?: string
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          application_id: string
          benefits: string[] | null
          created_at: string | null
          employer_id: string
          expiry_date: string | null
          id: string
          job_id: string
          notes: string | null
          responded_at: string | null
          salary_amount: number
          salary_currency: string
          sent_at: string | null
          start_date: string
          status: string
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          application_id: string
          benefits?: string[] | null
          created_at?: string | null
          employer_id: string
          expiry_date?: string | null
          id?: string
          job_id: string
          notes?: string | null
          responded_at?: string | null
          salary_amount: number
          salary_currency?: string
          sent_at?: string | null
          start_date: string
          status?: string
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          application_id?: string
          benefits?: string[] | null
          created_at?: string | null
          employer_id?: string
          expiry_date?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          responded_at?: string | null
          salary_amount?: number
          salary_currency?: string
          sent_at?: string | null
          start_date?: string
          status?: string
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          description: string | null
          employer_id: string
          id: string
          job_id: string | null
          metadata: Json | null
          paid_at: string | null
          payment_method: string | null
          payment_type: string
          status: string
          transaction_id: string | null
          updated_at: string | null
          worker_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          description?: string | null
          employer_id: string
          id?: string
          job_id?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          payment_type: string
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          worker_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          employer_id?: string
          id?: string
          job_id?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          payment_type?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          alert_frequency: string | null
          alerts_enabled: boolean | null
          created_at: string | null
          filters: Json
          id: string
          last_alerted_at: string | null
          name: string
          search_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_frequency?: string | null
          alerts_enabled?: boolean | null
          created_at?: string | null
          filters: Json
          id?: string
          last_alerted_at?: string | null
          name: string
          search_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_frequency?: string | null
          alerts_enabled?: boolean | null
          created_at?: string | null
          filters?: Json
          id?: string
          last_alerted_at?: string | null
          name?: string
          search_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shortlisted_workers: {
        Row: {
          created_at: string | null
          employer_id: string
          id: string
          list_name: string | null
          notes: string | null
          rating: number | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          created_at?: string | null
          employer_id: string
          id?: string
          list_name?: string | null
          notes?: string | null
          rating?: number | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          created_at?: string | null
          employer_id?: string
          id?: string
          list_name?: string | null
          notes?: string | null
          rating?: number | null
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: []
      }
      user_moderation: {
        Row: {
          action: string
          actioned_by: string
          created_at: string | null
          duration_days: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          reason: string
          user_id: string
        }
        Insert: {
          action: string
          actioned_by: string
          created_at?: string | null
          duration_days?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          reason: string
          user_id: string
        }
        Update: {
          action?: string
          actioned_by?: string
          created_at?: string | null
          duration_days?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_experience: {
        Row: {
          company_name: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          job_title: string
          location: string | null
          start_date: string
          worker_id: string
        }
        Insert: {
          company_name: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          job_title: string
          location?: string | null
          start_date: string
          worker_id: string
        }
        Update: {
          company_name?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          job_title?: string
          location?: string | null
          start_date?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_experience_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      worker_certifications: {
        Row: {
          certification_name: string
          created_at: string | null
          credential_id: string | null
          credential_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_organization: string | null
          verified: boolean | null
          worker_id: string
        }
        Insert: {
          certification_name: string
          created_at?: string | null
          credential_id?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_organization?: string | null
          verified?: boolean | null
          worker_id: string
        }
        Update: {
          certification_name?: string
          created_at?: string | null
          credential_id?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_organization?: string | null
          verified?: boolean | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_certifications_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      worker_documents: {
        Row: {
          document_name: string
          document_type: string
          file_size: number | null
          file_url: string
          id: string
          uploaded_at: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          worker_id: string
        }
        Insert: {
          document_name: string
          document_type: string
          file_size?: number | null
          file_url: string
          id?: string
          uploaded_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          worker_id: string
        }
        Update: {
          document_name?: string
          document_type?: string
          file_size?: number | null
          file_url?: string
          id?: string
          uploaded_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_documents_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      worker_profiles: {
        Row: {
          availability: string | null
          bio: string | null
          created_at: string | null
          currency: string | null
          current_location: string | null
          ecr_category: string | null
          ecr_status: string | null
          expected_salary_max: number | null
          expected_salary_min: number | null
          has_passport: boolean | null
          has_visa: boolean | null
          id: string
          languages: string[] | null
          nationality: string | null
          passport_number: string | null
          updated_at: string | null
          user_id: string
          visa_countries: string[] | null
          years_of_experience: number | null
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          created_at?: string | null
          currency?: string | null
          current_location?: string | null
          ecr_category?: string | null
          ecr_status?: string | null
          expected_salary_max?: number | null
          expected_salary_min?: number | null
          has_passport?: boolean | null
          has_visa?: boolean | null
          id?: string
          languages?: string[] | null
          nationality?: string | null
          passport_number?: string | null
          updated_at?: string | null
          user_id: string
          visa_countries?: string[] | null
          years_of_experience?: number | null
        }
        Update: {
          availability?: string | null
          bio?: string | null
          created_at?: string | null
          currency?: string | null
          current_location?: string | null
          ecr_category?: string | null
          ecr_status?: string | null
          expected_salary_max?: number | null
          expected_salary_min?: number | null
          has_passport?: boolean | null
          has_visa?: boolean | null
          id?: string
          languages?: string[] | null
          nationality?: string | null
          passport_number?: string | null
          updated_at?: string | null
          user_id?: string
          visa_countries?: string[] | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      worker_skills: {
        Row: {
          created_at: string | null
          id: string
          proficiency_level: string | null
          skill_name: string
          worker_id: string
          years_of_experience: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          proficiency_level?: string | null
          skill_name: string
          worker_id: string
          years_of_experience?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          proficiency_level?: string | null
          skill_name?: string
          worker_id?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_skills_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      worker_videos: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          skills_demonstrated: string[] | null
          thumbnail_url: string | null
          title: string
          video_url: string
          views_count: number | null
          worker_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          skills_demonstrated?: string[] | null
          thumbnail_url?: string | null
          title: string
          video_url: string
          views_count?: number | null
          worker_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          skills_demonstrated?: string[] | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string
          views_count?: number | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_videos_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_worker_profile_for_employer: {
        Args: { p_worker_id: string }
        Returns: {
          availability: string
          bio: string
          created_at: string
          currency: string
          current_location: string
          ecr_category: string
          ecr_status: string
          expected_salary_max: number
          expected_salary_min: number
          has_passport: boolean
          has_visa: boolean
          id: string
          languages: string[]
          nationality: string
          updated_at: string
          user_id: string
          visa_countries: string[]
          years_of_experience: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "employer" | "worker"
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
      app_role: ["admin", "employer", "worker"],
    },
  },
} as const
