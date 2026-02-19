import { Skeleton } from '@/components/ui/skeleton'

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Thumbnail skeleton */}
      <Skeleton className="aspect-video w-full" />
      <div className="p-3">
        {/* Título */}
        <Skeleton className="mb-2 h-4 w-3/4" />
        <Skeleton className="mb-3 h-4 w-1/2" />
        {/* Badges */}
        <div className="mb-3 flex gap-1">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>
        {/* Preço */}
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  )
}

export default function CatalogLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Título hero mobile skeleton */}
      <div className="mb-6 sm:hidden">
        <Skeleton className="h-8 w-64" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar skeleton — desktop */}
        <aside className="hidden lg:block w-52 shrink-0 space-y-4">
          <Skeleton className="h-5 w-24" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          <Skeleton className="h-5 w-20 mt-4" />
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </aside>

        {/* Grid skeleton */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
