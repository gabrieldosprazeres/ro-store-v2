const YEAR = new Date().getFullYear()

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {YEAR} RO Store. Todos os direitos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Produtos digitais — consulte os{' '}
            <span className="underline underline-offset-4 cursor-pointer hover:text-foreground transition-colors">
              termos de compra
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
