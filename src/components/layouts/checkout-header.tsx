import Link from 'next/link'

export function CheckoutHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto flex h-14 items-center justify-center px-4">
        <Link href="/" className="text-lg font-bold text-primary">
          RO Store
        </Link>
      </div>
    </header>
  )
}
