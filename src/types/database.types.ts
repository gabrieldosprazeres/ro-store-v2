// Gerado pelo Supabase CLI após a migration:
// supabase gen types typescript --local > src/types/database.types.ts
//
// Este arquivo é um placeholder. Substituir pelo output do CLI após executar a migration (Task 1.3).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'customer' | 'admin'
          full_name: string | null
          cpf_cnpj: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'customer' | 'admin'
          full_name?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'customer' | 'admin'
          full_name?: string | null
          cpf_cnpj?: string | null
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          slug: string
          title: string
          description: string
          price: number
          category: string
          compatible_emulators: string[]
          installation_type: string
          client_requirements: string | null
          youtube_url: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description: string
          price: number
          category: string
          compatible_emulators: string[]
          installation_type: string
          client_requirements?: string | null
          youtube_url?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          title?: string
          description?: string
          price?: number
          category?: string
          compatible_emulators?: string[]
          installation_type?: string
          client_requirements?: string | null
          youtube_url?: string | null
          is_published?: boolean
          updated_at?: string
        }
      }
      product_versions: {
        Row: {
          id: string
          product_id: string
          version: string
          changelog: string
          // file_path_secure nunca incluída em selects retornados ao client
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          version: string
          changelog: string
          file_path_secure: string
          published_at?: string | null
          created_at?: string
        }
        Update: {
          version?: string
          changelog?: string
          file_path_secure?: string
          published_at?: string | null
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          url?: string
          alt_text?: string | null
          display_order?: number
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'paid' | 'expired' | 'failed'
          payment_method: 'pix' | 'boleto' | 'credit_card'
          amount: number
          asaas_payment_id: string | null
          pix_qr_code: string | null
          pix_copy_paste: string | null
          boleto_url: string | null
          boleto_barcode: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'pending' | 'paid' | 'expired' | 'failed'
          payment_method: 'pix' | 'boleto' | 'credit_card'
          amount: number
          asaas_payment_id?: string | null
          pix_qr_code?: string | null
          pix_copy_paste?: string | null
          boleto_url?: string | null
          boleto_barcode?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'paid' | 'expired' | 'failed'
          asaas_payment_id?: string | null
          pix_qr_code?: string | null
          pix_copy_paste?: string | null
          boleto_url?: string | null
          boleto_barcode?: string | null
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_version_id: string
          unit_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_version_id: string
          unit_price: number
          created_at?: string
        }
        Update: Record<string, never>
      }
      licenses: {
        Row: {
          id: string
          order_id: string
          product_id: string
          user_id: string
          license_key: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          user_id: string
          license_key: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          is_active?: boolean
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          product_id: string | null
          order_id: string | null
          ip_address: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          product_id?: string | null
          order_id?: string | null
          ip_address?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: Record<string, never>  // audit_log é imutável
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'customer' | 'admin'
      order_status: 'pending' | 'paid' | 'expired' | 'failed'
      payment_method: 'pix' | 'boleto' | 'credit_card'
    }
  }
}
