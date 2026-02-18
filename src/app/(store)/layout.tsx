import { Suspense } from 'react'
import { SiteHeader } from '@/components/layouts/site-header'
import { SiteFooter } from '@/components/layouts/site-footer'

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <span className="text-xl font-bold text-primary">RO Store</span>
      </div>
    </header>
  )
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<HeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
