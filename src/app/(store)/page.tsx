import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Catálogo',
}

// Sprint 3 — CatalogFilters, ProductGrid
export default function CatalogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground">Catálogo</h1>
      <p className="mt-2 text-muted-foreground">
        Implementado na Sprint 3.
      </p>
    </div>
  )
}
