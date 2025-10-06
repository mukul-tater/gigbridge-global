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
      contracts: {
        Row: {
          contract_file_url: string | null
          contract_terms: string
          created_at: string
          currency: string | null
          employer_id: string
          employer_signed_at: string | null
          end_date: string | null
          id: string
          job_id: string
          salary: number
          start_date: string
          status: Database["public"]["Enums"]["contract_status"] | null
          updated_at: string
          worker_id: string
          worker_signed_at: string | null
        }
        Insert: {
          contract_file_url?: string | null
          contract_terms: string
          created_at?: string
          currency?: string | null
          employer_id: string
          employer_signed_at?: string | null
          end_date?: string | null
          id?: string
          job_id: string
          salary: number
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"] | null
          updated_at?: string
          worker_id: string
          worker_signed_at?: string | null
        }
        Update: {
          contract_file_url?: string | null
          contract_terms?: string
          created_at?: string
          currency?: string | null
          employer_id?: string
          employer_signed_at?: string | null
          end_date?: string | null
          id?: string
          job_id?: string
          salary?: number
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"] | null
          updated_at?: string
          worker_id?: string
          worker_signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          is_verified: boolean | null
          mime_type: string | null
          uploaded_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          uploaded_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_type?: Database["public"]["Enums"]["document_type"]
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          uploaded_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      employer_profiles: {
        Row: {
          address: string | null
          city: string
          company_name: string
          company_registration_number: string | null
          company_size: string | null
          contact_email: string
          contact_person_name: string
          contact_phone: string
          country: string
          created_at: string
          description: string | null
          id: string
          industry: string
          logo_url: string | null
          status: Database["public"]["Enums"]["employer_status"] | null
          updated_at: string
          user_id: string
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          city: string
          company_name: string
          company_registration_number?: string | null
          company_size?: string | null
          contact_email: string
          contact_person_name: string
          contact_phone: string
          country: string
          created_at?: string
          description?: string | null
          id?: string
          industry: string
          logo_url?: string | null
          status?: Database["public"]["Enums"]["employer_status"] | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          company_name?: string
          company_registration_number?: string | null
          company_size?: string | null
          contact_email?: string
          contact_person_name?: string
          contact_phone?: string
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          industry?: string
          logo_url?: string | null
          status?: Database["public"]["Enums"]["employer_status"] | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          application_status: string | null
          applied_at: string
          available_from: string | null
          cover_letter: string | null
          expected_salary: number | null
          id: string
          job_id: string
          reviewed_at: string | null
          visa_status: Database["public"]["Enums"]["visa_status"] | null
          worker_id: string
        }
        Insert: {
          application_status?: string | null
          applied_at?: string
          available_from?: string | null
          cover_letter?: string | null
          expected_salary?: number | null
          id?: string
          job_id: string
          reviewed_at?: string | null
          visa_status?: Database["public"]["Enums"]["visa_status"] | null
          worker_id: string
        }
        Update: {
          application_status?: string | null
          applied_at?: string
          available_from?: string | null
          cover_letter?: string | null
          expected_salary?: number | null
          id?: string
          job_id?: string
          reviewed_at?: string | null
          visa_status?: Database["public"]["Enums"]["visa_status"] | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          accommodation_provided: boolean | null
          application_deadline: string | null
          benefits: string | null
          city: string | null
          contract_duration_months: number | null
          country: string
          created_at: string
          currency: string | null
          description: string
          employer_id: string
          food_provided: boolean | null
          id: string
          insurance_provided: boolean | null
          job_type: string
          max_salary: number | null
          min_salary: number | null
          positions_available: number | null
          positions_filled: number | null
          requirements: string | null
          status: Database["public"]["Enums"]["job_status"] | null
          title: string
          transport_provided: boolean | null
          updated_at: string
          visa_sponsorship: boolean | null
        }
        Insert: {
          accommodation_provided?: boolean | null
          application_deadline?: string | null
          benefits?: string | null
          city?: string | null
          contract_duration_months?: number | null
          country: string
          created_at?: string
          currency?: string | null
          description: string
          employer_id: string
          food_provided?: boolean | null
          id?: string
          insurance_provided?: boolean | null
          job_type: string
          max_salary?: number | null
          min_salary?: number | null
          positions_available?: number | null
          positions_filled?: number | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title: string
          transport_provided?: boolean | null
          updated_at?: string
          visa_sponsorship?: boolean | null
        }
        Update: {
          accommodation_provided?: boolean | null
          application_deadline?: string | null
          benefits?: string | null
          city?: string | null
          contract_duration_months?: number | null
          country?: string
          created_at?: string
          currency?: string | null
          description?: string
          employer_id?: string
          food_provided?: boolean | null
          id?: string
          insurance_provided?: boolean | null
          job_type?: string
          max_salary?: number | null
          min_salary?: number | null
          positions_available?: number | null
          positions_filled?: number | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title?: string
          transport_provided?: boolean | null
          updated_at?: string
          visa_sponsorship?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_skills: {
        Row: {
          id: string
          is_mandatory: boolean | null
          job_id: string
          required_level: Database["public"]["Enums"]["skill_level"] | null
          skill_id: string
        }
        Insert: {
          id?: string
          is_mandatory?: boolean | null
          job_id: string
          required_level?: Database["public"]["Enums"]["skill_level"] | null
          skill_id: string
        }
        Update: {
          id?: string
          is_mandatory?: boolean | null
          job_id?: string
          required_level?: Database["public"]["Enums"]["skill_level"] | null
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          contract_id: string | null
          id: string
          is_read: boolean | null
          job_id: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          sent_at: string
          subject: string | null
        }
        Insert: {
          content: string
          contract_id?: string | null
          id?: string
          is_read?: boolean | null
          job_id?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          sent_at?: string
          subject?: string | null
        }
        Update: {
          content?: string
          contract_id?: string | null
          id?: string
          is_read?: boolean | null
          job_id?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          sent_at?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          sent_via: string[] | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          sent_via?: string[] | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          sent_via?: string[] | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          contract_id: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          payee_id: string | null
          payer_id: string
          payment_type: string
          processed_at: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          contract_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          payee_id?: string | null
          payer_id: string
          payment_type: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          contract_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          payee_id?: string | null
          payer_id?: string
          payment_type?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          contact_number: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          contact_number: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          contact_number?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
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
      worker_onboarding: {
        Row: {
          created_at: string
          current_step: number
          id: string
          rejection_reasons: string[] | null
          status: Database["public"]["Enums"]["onboarding_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          current_step?: number
          id?: string
          rejection_reasons?: string[] | null
          status?: Database["public"]["Enums"]["onboarding_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          current_step?: number
          id?: string
          rejection_reasons?: string[] | null
          status?: Database["public"]["Enums"]["onboarding_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      worker_onboarding_certifications: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          issue_date: string
          issuer: string
          name: string
          onboarding_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          issue_date: string
          issuer: string
          name: string
          onboarding_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          issue_date?: string
          issuer?: string
          name?: string
          onboarding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_onboarding_certifications_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "worker_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_onboarding_documents: {
        Row: {
          created_at: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_size: number
          file_url: string
          id: string
          mime_type: string
          ocr_data: Json | null
          onboarding_id: string
          status: Database["public"]["Enums"]["document_status"]
          storage_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_size: number
          file_url: string
          id?: string
          mime_type: string
          ocr_data?: Json | null
          onboarding_id: string
          status?: Database["public"]["Enums"]["document_status"]
          storage_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          file_name?: string
          file_size?: number
          file_url?: string
          id?: string
          mime_type?: string
          ocr_data?: Json | null
          onboarding_id?: string
          status?: Database["public"]["Enums"]["document_status"]
          storage_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_onboarding_documents_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "worker_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_onboarding_languages: {
        Row: {
          created_at: string
          id: string
          language_name: string
          onboarding_id: string
          proficiency: Database["public"]["Enums"]["proficiency_level"]
        }
        Insert: {
          created_at?: string
          id?: string
          language_name: string
          onboarding_id: string
          proficiency: Database["public"]["Enums"]["proficiency_level"]
        }
        Update: {
          created_at?: string
          id?: string
          language_name?: string
          onboarding_id?: string
          proficiency?: Database["public"]["Enums"]["proficiency_level"]
        }
        Relationships: [
          {
            foreignKeyName: "worker_onboarding_languages_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "worker_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_onboarding_preferences: {
        Row: {
          availability_date: string
          contract_length: string
          created_at: string
          expected_wage_amount: number
          expected_wage_currency: string
          id: string
          onboarding_id: string
          preferred_countries: string[]
          updated_at: string
        }
        Insert: {
          availability_date: string
          contract_length: string
          created_at?: string
          expected_wage_amount: number
          expected_wage_currency?: string
          id?: string
          onboarding_id: string
          preferred_countries?: string[]
          updated_at?: string
        }
        Update: {
          availability_date?: string
          contract_length?: string
          created_at?: string
          expected_wage_amount?: number
          expected_wage_currency?: string
          id?: string
          onboarding_id?: string
          preferred_countries?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_onboarding_preferences_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: true
            referencedRelation: "worker_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_onboarding_profile: {
        Row: {
          created_at: string
          date_of_birth: string
          email: string
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          onboarding_id: string
          phone: string
          profile_photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          email: string
          full_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          onboarding_id: string
          phone: string
          profile_photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          email?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          onboarding_id?: string
          phone?: string
          profile_photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_onboarding_profile_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: true
            referencedRelation: "worker_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_onboarding_skills: {
        Row: {
          created_at: string
          experience_years: number
          id: string
          onboarding_id: string
          skill_name: string
        }
        Insert: {
          created_at?: string
          experience_years?: number
          id?: string
          onboarding_id: string
          skill_name: string
        }
        Update: {
          created_at?: string
          experience_years?: number
          id?: string
          onboarding_id?: string
          skill_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_onboarding_skills_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "worker_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_onboarding_work_history: {
        Row: {
          company_name: string
          created_at: string
          end_date: string | null
          id: string
          is_current: boolean
          onboarding_id: string
          responsibilities: string | null
          role: string
          start_date: string
        }
        Insert: {
          company_name: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_current?: boolean
          onboarding_id: string
          responsibilities?: string | null
          role: string
          start_date: string
        }
        Update: {
          company_name?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_current?: boolean
          onboarding_id?: string
          responsibilities?: string | null
          role?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_onboarding_work_history_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "worker_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_profiles: {
        Row: {
          aadhaar_number: string | null
          available_from: string | null
          bio: string | null
          contract_duration_months: number | null
          created_at: string
          currency: string | null
          date_of_birth: string | null
          email: string
          expected_max_salary: number | null
          expected_min_salary: number | null
          first_name: string
          id: string
          kyc_verified: boolean | null
          languages: string[] | null
          last_name: string
          nationality: string
          passport_number: string | null
          phone: string
          preferred_countries: string[] | null
          profile_photo_url: string | null
          status: Database["public"]["Enums"]["worker_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aadhaar_number?: string | null
          available_from?: string | null
          bio?: string | null
          contract_duration_months?: number | null
          created_at?: string
          currency?: string | null
          date_of_birth?: string | null
          email: string
          expected_max_salary?: number | null
          expected_min_salary?: number | null
          first_name: string
          id?: string
          kyc_verified?: boolean | null
          languages?: string[] | null
          last_name: string
          nationality: string
          passport_number?: string | null
          phone: string
          preferred_countries?: string[] | null
          profile_photo_url?: string | null
          status?: Database["public"]["Enums"]["worker_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aadhaar_number?: string | null
          available_from?: string | null
          bio?: string | null
          contract_duration_months?: number | null
          created_at?: string
          currency?: string | null
          date_of_birth?: string | null
          email?: string
          expected_max_salary?: number | null
          expected_min_salary?: number | null
          first_name?: string
          id?: string
          kyc_verified?: boolean | null
          languages?: string[] | null
          last_name?: string
          nationality?: string
          passport_number?: string | null
          phone?: string
          preferred_countries?: string[] | null
          profile_photo_url?: string | null
          status?: Database["public"]["Enums"]["worker_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      worker_skills: {
        Row: {
          certificate_url: string | null
          certified: boolean | null
          id: string
          level: Database["public"]["Enums"]["skill_level"] | null
          skill_id: string
          worker_id: string
          years_experience: number | null
        }
        Insert: {
          certificate_url?: string | null
          certified?: boolean | null
          id?: string
          level?: Database["public"]["Enums"]["skill_level"] | null
          skill_id: string
          worker_id: string
          years_experience?: number | null
        }
        Update: {
          certificate_url?: string | null
          certified?: boolean | null
          id?: string
          level?: Database["public"]["Enums"]["skill_level"] | null
          skill_id?: string
          worker_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_skills_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_skills_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      worker_profiles_public: {
        Row: {
          aadhaar_number: string | null
          available_from: string | null
          bio: string | null
          contract_duration_months: number | null
          created_at: string | null
          currency: string | null
          date_of_birth: string | null
          email: string | null
          expected_max_salary: number | null
          expected_min_salary: number | null
          first_name: string | null
          id: string | null
          kyc_verified: boolean | null
          languages: string[] | null
          last_name: string | null
          nationality: string | null
          passport_number: string | null
          phone: string | null
          preferred_countries: string[] | null
          profile_photo_url: string | null
          status: Database["public"]["Enums"]["worker_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          aadhaar_number?: never
          available_from?: string | null
          bio?: string | null
          contract_duration_months?: number | null
          created_at?: string | null
          currency?: string | null
          date_of_birth?: never
          email?: never
          expected_max_salary?: number | null
          expected_min_salary?: number | null
          first_name?: string | null
          id?: string | null
          kyc_verified?: boolean | null
          languages?: string[] | null
          last_name?: string | null
          nationality?: string | null
          passport_number?: never
          phone?: never
          preferred_countries?: string[] | null
          profile_photo_url?: string | null
          status?: Database["public"]["Enums"]["worker_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          aadhaar_number?: never
          available_from?: string | null
          bio?: string | null
          contract_duration_months?: number | null
          created_at?: string | null
          currency?: string | null
          date_of_birth?: never
          email?: never
          expected_max_salary?: number | null
          expected_min_salary?: number | null
          first_name?: string | null
          id?: string | null
          kyc_verified?: boolean | null
          languages?: string[] | null
          last_name?: string | null
          nationality?: string | null
          passport_number?: never
          phone?: never
          preferred_countries?: string[] | null
          profile_photo_url?: string | null
          status?: Database["public"]["Enums"]["worker_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      employer_has_business_relationship: {
        Args: { _employer_user_id: string; _worker_id: string }
        Returns: boolean
      }
      get_signed_document_url: {
        Args: { document_id: string; expires_in_seconds?: number }
        Returns: string
      }
      get_worker_sensitive_data: {
        Args: { _worker_id: string }
        Returns: {
          aadhaar_number: string
          date_of_birth: string
          email: string
          passport_number: string
          phone: string
          worker_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mask_aadhaar: {
        Args: { aadhaar_number: string }
        Returns: string
      }
      mask_pan: {
        Args: { pan_number: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      contract_status:
        | "pending"
        | "signed"
        | "active"
        | "completed"
        | "cancelled"
      document_status: "uploaded" | "approved" | "rejected"
      document_type:
        | "passport"
        | "aadhaar"
        | "visa"
        | "certificate"
        | "license"
        | "photo"
        | "resume"
        | "contract"
        | "aadhaar_front"
        | "aadhaar_back"
        | "pan"
      employer_status: "pending" | "verified" | "suspended" | "blocked"
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      job_status: "draft" | "published" | "filled" | "expired" | "cancelled"
      onboarding_status:
        | "draft"
        | "pending_verification"
        | "verified"
        | "rejected"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
      proficiency_level: "basic" | "conversational" | "fluent" | "native"
      skill_level: "beginner" | "intermediate" | "advanced" | "expert"
      visa_status:
        | "not_required"
        | "pending"
        | "approved"
        | "rejected"
        | "expired"
      worker_status: "pending" | "verified" | "suspended" | "blocked"
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
      contract_status: [
        "pending",
        "signed",
        "active",
        "completed",
        "cancelled",
      ],
      document_status: ["uploaded", "approved", "rejected"],
      document_type: [
        "passport",
        "aadhaar",
        "visa",
        "certificate",
        "license",
        "photo",
        "resume",
        "contract",
        "aadhaar_front",
        "aadhaar_back",
        "pan",
      ],
      employer_status: ["pending", "verified", "suspended", "blocked"],
      gender_type: ["male", "female", "other", "prefer_not_to_say"],
      job_status: ["draft", "published", "filled", "expired", "cancelled"],
      onboarding_status: [
        "draft",
        "pending_verification",
        "verified",
        "rejected",
      ],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
      ],
      proficiency_level: ["basic", "conversational", "fluent", "native"],
      skill_level: ["beginner", "intermediate", "advanced", "expert"],
      visa_status: [
        "not_required",
        "pending",
        "approved",
        "rejected",
        "expired",
      ],
      worker_status: ["pending", "verified", "suspended", "blocked"],
    },
  },
} as const
