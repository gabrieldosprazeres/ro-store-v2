import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY é obrigatório'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY é obrigatório'),
  ASAAS_API_KEY: z.string().min(1, 'ASAAS_API_KEY é obrigatório'),
  ASAAS_WEBHOOK_TOKEN: z.string().min(1, 'ASAAS_WEBHOOK_TOKEN é obrigatório'),
  ASAAS_BASE_URL: z.string().url('ASAAS_BASE_URL deve ser uma URL válida'),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY é obrigatório'),
  RESEND_FROM_EMAIL: z.string().email('RESEND_FROM_EMAIL deve ser um e-mail válido'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const errors = parsed.error.issues.map(e => `  • ${String(e.path[0])}: ${e.message}`).join('\n')
  throw new Error(`\n[env] Variáveis de ambiente inválidas ou ausentes:\n${errors}\n`)
}

export const env = parsed.data
