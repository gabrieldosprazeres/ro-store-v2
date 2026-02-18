'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type UpdatePasswordInput,
} from '@/lib/validators/auth-schema'
import type { ActionResult } from '@/types/actions'

export async function signIn(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Dados inválidos' }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (error) {
      // Não revelar qual campo está errado — mensagem genérica
      return { success: false, error: 'E-mail ou senha incorretos' }
    }

    // Registrar evento de login no audit log
    if (data.user) {
      await supabase.from('audit_logs').insert({
        action: 'customer_login',
        user_id: data.user.id,
        metadata: { method: 'email' },
      } as never)
    }

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Erro inesperado. Tente novamente.' }
  }
}

export async function signUp(
  input: RegisterInput
): Promise<ActionResult<{ message: string }>> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Dados inválidos' }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (error) {
      // Não revelar se o e-mail já existe
      return { success: false, error: 'Não foi possível criar a conta. Tente novamente.' }
    }

    // Supabase retorna identities vazias quando e-mail já está cadastrado
    if (data.user && data.user.identities?.length === 0) {
      return { success: false, error: 'Não foi possível criar a conta. Tente novamente.' }
    }

    return {
      success: true,
      data: { message: 'Verifique seu e-mail para confirmar o cadastro.' },
    }
  } catch {
    return { success: false, error: 'Erro inesperado. Tente novamente.' }
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function resetPassword(
  input: ResetPasswordInput
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'E-mail inválido' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/update-password`,
    })

    if (error) {
      return { success: false, error: 'Não foi possível enviar o e-mail. Tente novamente.' }
    }

    // Resposta genérica para não revelar se o e-mail existe
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Erro inesperado. Tente novamente.' }
  }
}

export async function updatePassword(
  input: UpdatePasswordInput
): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Dados inválidos' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    })

    if (error) {
      return { success: false, error: 'Não foi possível atualizar a senha. Tente novamente.' }
    }

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Erro inesperado. Tente novamente.' }
  }
}
