import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
  }

  // Fluxo de recuperação de senha — redirecionar para tela de nova senha
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/update-password`)
  }

  // Registrar login via Discord no audit log
  if (data.user) {
    await supabase.from('audit_logs').insert({
      action: 'customer_login',
      user_id: data.user.id,
      metadata: { method: 'discord' },
    })
  }

  // Redirecionar para a URL de retorno (ex: /checkout) ou raiz
  const safeNext = next.startsWith('/') ? next : '/'
  return NextResponse.redirect(`${origin}${safeNext}`)
}
