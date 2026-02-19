import { Skeleton } from '@/components/ui/skeleton'

export default function PDPLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Skeleton className="mb-6 h-8 w-24" />

      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10">
        {/* Coluna esquerda */}
        <div>
          {/* Galeria skeleton */}
          <Skeleton className="aspect-video w-full rounded-lg" />
          <div className="mt-2 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video w-20 rounded" />
            ))}
          </div>
        </div>

        {/* Coluna direita */}
        <div className="mt-6 space-y-4 lg:mt-0">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-32" />

          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>

          <Skeleton className="h-px w-full" />

          {/* Tabela compat */}
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>

          <Skeleton className="h-px w-full" />

          {/* CTA */}
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
