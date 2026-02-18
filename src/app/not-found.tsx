import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="text-7xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-semibold text-foreground">
          Página não encontrada
        </h1>
        <p className="text-muted-foreground">
          O endereço que você acessou não existe ou foi removido.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Voltar ao catálogo</Link>
      </Button>
    </div>
  )
}
