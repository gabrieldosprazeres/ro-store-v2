import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase-server'
import { CatalogFilters } from '@/components/catalog/catalog-filters'
import { ProductGrid } from '@/components/catalog/product-grid'
import { ActiveFilters } from '@/components/catalog/active-filters'

export const metadata: Metadata = {
  title: 'Catálogo — RO Store',
  description: 'Scripts e plugins para servidores de Ragnarok Online.',
}

interface CatalogPageProps {
  searchParams: Promise<{
    categories?: string
    emulators?: string
  }>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { categories: categoriesParam, emulators: emulatorsParam } = await searchParams

  const selectedCategories = categoriesParam
    ? categoriesParam.split(',').map((c) => c.trim()).filter(Boolean)
    : []
  const selectedEmulators = emulatorsParam
    ? emulatorsParam.split(',').map((e) => e.trim()).filter(Boolean)
    : []

  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(
      'id, slug, title, price, category, emulators, install_type, product_images(storage_path, display_order)'
    )
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (selectedCategories.length > 0) {
    query = query.in('category', selectedCategories)
  }

  if (selectedEmulators.length > 0) {
    // Produto deve ter todos os emuladores selecionados no array (AND semântico)
    for (const emulator of selectedEmulators) {
      query = query.contains('emulators', [emulator])
    }
  }

  const { data: products } = await query

  const normalizedProducts = (products ?? []).map((product) => {
    const images = (product.product_images as { storage_path: string; display_order: number }[]) ?? []
    const sorted = [...images].sort((a, b) => a.display_order - b.display_order)
    return {
      ...product,
      thumbnail: sorted[0]?.storage_path ?? null,
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Título hero — visível apenas no mobile */}
      <div className="mb-6 sm:hidden">
        <h1 className="text-2xl font-bold text-foreground">
          Scripts e Plugins para Ragnarok Online
        </h1>
      </div>

      <div className="flex gap-8">
        {/* Sidebar de filtros — desktop */}
        <aside className="hidden lg:block w-52 shrink-0">
          <CatalogFilters
            selectedCategories={selectedCategories}
            selectedEmulators={selectedEmulators}
          />
        </aside>

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">
          {/* Barra superior: botão Filtros (mobile) + chips de filtros ativos */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {/* Botão filtros — mobile only */}
            <div className="lg:hidden">
              <CatalogFilters
                selectedCategories={selectedCategories}
                selectedEmulators={selectedEmulators}
                mobile
              />
            </div>

            <ActiveFilters
              selectedCategories={selectedCategories}
              selectedEmulators={selectedEmulators}
            />
          </div>

          <ProductGrid products={normalizedProducts} />
        </div>
      </div>
    </div>
  )
}
