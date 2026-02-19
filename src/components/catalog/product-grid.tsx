import Link from 'next/link'
import { PackageSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/catalog/product-card'

interface Product {
  id: string
  slug: string
  title: string
  price: number
  category: string
  emulators: string[]
  thumbnail: string | null
}

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PackageSearch
          size={48}
          className="mb-4 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="mb-1 text-lg font-semibold text-foreground">
          Nenhum produto encontrado
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Tente uma combinação diferente de filtros.
        </p>
        <Button variant="outline" asChild>
          <Link href="/">Limpar filtros</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
