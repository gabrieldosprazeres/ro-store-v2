import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase-middleware'

export default async function proxy(request: NextRequest) {
  const { supabase, response: supabaseResponse } = createMiddlewareClient(request)

  // Sempre getUser() — nunca getSession() (vulnerabilidade de segurança)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // /api/webhooks/* — sem auth de usuário (autenticação via token do Asaas no header)
  if (pathname.startsWith('/api/webhooks')) {
    return supabaseResponse
  }

  // Usuário autenticado tentando acessar rotas de auth → redirecionar para raiz
  if (
    user &&
    (pathname === '/auth/login' || pathname === '/auth/register')
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Rotas protegidas: /pedidos e /checkout → redirecionar para login se não autenticado
  if (
    !user &&
    (pathname.startsWith('/pedidos') || pathname.startsWith('/checkout'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // /admin → verificar autenticação E role admin
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as { role: string } | null

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
