import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'

export async function SiteHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">RO Store</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/pedidos"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Meus Pedidos
              </Link>
              <form action="/auth/signout" method="post">
                <Button variant="ghost" size="sm" type="submit">
                  Sair
                </Button>
              </form>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth/login">Entrar</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
