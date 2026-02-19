import Link from 'next/link'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getImageUrl } from '@/lib/utils'

interface ProductCardProps {
  product: {
    id: string
    slug: string
    title: string
    price: number
    category: string
    emulators: string[]
    thumbnail: string | null
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.thumbnail ? getImageUrl(product.thumbnail) : null

  return (
    <Link href={`/produtos/${product.slug}`} className="group block">
      <Card className="overflow-hidden border-border bg-card transition-all duration-150 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_hsl(262_83%_58%/0.2)]">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package size={32} className="text-muted-foreground" aria-hidden="true" />
            </div>
          )}
        </div>

        <CardContent className="p-3">
          {/* Título */}
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-base">
            {product.title}
          </h3>

          {/* Badges */}
          <div className="mb-3 flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            {product.emulators.map((emulator) => (
              <Badge key={emulator} variant="outline" className="text-xs">
                {emulator}
              </Badge>
            ))}
          </div>

          {/* Preço */}
          <p className="text-base font-bold text-accent sm:text-lg">
            {formatCurrency(product.price)}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
