import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, getImageUrl } from '@/lib/utils'
import { ProductGallery } from '@/components/product/product-gallery'
import { YouTubeEmbed } from '@/components/product/youtube-embed'
import { CompatibilityTable } from '@/components/product/compatibility-table'
import { ChangelogAccordion } from '@/components/product/changelog-accordion'

interface PDPPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PDPPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('title, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!product) return { title: 'Produto não encontrado' }

  return {
    title: `${product.title} — RO Store`,
    description: product.description?.slice(0, 160),
  }
}

export default async function PDPPage({ params }: PDPPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Buscar produto com imagens e versões
  const { data: product } = await supabase
    .from('products')
    .select(
      'id, slug, title, price, description, category, emulators, install_type, client_requirements, youtube_url, product_images(id, storage_path, display_order), product_versions(id, version_number, changelog, created_at)'
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!product) {
    notFound()
  }

  // Ordenar imagens e versões
  const images = (
    product.product_images as { id: string; storage_path: string; display_order: number }[]
  )
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => ({ id: img.id, url: getImageUrl(img.storage_path), alt: product.title }))

  const versions = (
    product.product_versions as {
      id: string
      version_number: string
      changelog: string
      created_at: string
    }[]
  )
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Verificar se o usuário já possui licença ativa
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let hasActiveLicense = false
  if (user) {
    const { data: license } = await supabase
      .from('licenses')
      .select('id')
      .eq('product_id', product.id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    hasActiveLicense = !!license
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb / Voltar */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
          <Link href="/">
            <ChevronLeft size={16} aria-hidden="true" />
            Catálogo
          </Link>
        </Button>
      </div>

      {/* Layout desktop: 2 colunas */}
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10">
        {/* Coluna esquerda: galeria + vídeo + tabs */}
        <div>
          {/* Galeria de imagens */}
          <ProductGallery images={images} title={product.title} />

          {/* YouTube embed — abaixo da galeria */}
          {product.youtube_url && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                Vídeo demonstração
              </h2>
              <YouTubeEmbed url={product.youtube_url} title={product.title} />
            </div>
          )}

          {/* Tabs (desktop) — descrição e changelog */}
          <div className="mt-8 hidden lg:block">
            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">Descrição</TabsTrigger>
                <TabsTrigger value="changelog">Changelog</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <p className="whitespace-pre-line text-base text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </TabsContent>
              <TabsContent value="changelog" className="mt-4">
                <ChangelogAccordion versions={versions} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Coluna direita: info + CTA */}
        <div className="mt-6 lg:mt-0">
          {/* Título e preço */}
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">{product.title}</h1>
          <p className="mt-2 text-2xl font-bold text-accent lg:text-3xl">
            {formatCurrency(product.price)}
          </p>

          {/* Badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            {product.emulators.map((emulator: string) => (
              <Badge key={emulator} variant="outline">
                {emulator}
              </Badge>
            ))}
            <Badge variant="outline">{product.install_type}</Badge>
          </div>

          <Separator className="my-4" />

          {/* Tabela de compatibilidade — desktop */}
          <div className="hidden lg:block">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Compatibilidade</h2>
            <CompatibilityTable
              emulators={product.emulators}
              installType={product.install_type}
              clientRequirements={product.client_requirements}
            />
          </div>

          <Separator className="my-4 hidden lg:block" />

          {/* CTA */}
          <div className="mt-4 lg:mt-0">
            {hasActiveLicense ? (
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-center">
                <p className="mb-2 text-sm font-medium text-primary">
                  Você já possui uma licença ativa para este produto.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/pedidos">Ver em Meus Pedidos</Link>
                </Button>
              </div>
            ) : (
              <Button className="w-full" size="lg" asChild>
                <Link
                  href={
                    user
                      ? `/checkout/${product.id}`
                      : `/auth/login?next=/checkout/${product.id}`
                  }
                >
                  Comprar — {formatCurrency(product.price)}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: descrição e changelog abaixo do CTA */}
      <div className="mt-8 lg:hidden">
        <h2 className="mb-2 text-lg font-semibold text-foreground">Sobre este produto</h2>
        <p className="whitespace-pre-line text-base text-muted-foreground leading-relaxed">
          {product.description}
        </p>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-foreground">Compatibilidade</h2>
        <CompatibilityTable
          emulators={product.emulators}
          installType={product.install_type}
          clientRequirements={product.client_requirements}
        />

        <h2 className="mb-3 mt-6 text-lg font-semibold text-foreground">
          Histórico de versões
        </h2>
        <ChangelogAccordion versions={versions} />
      </div>

      {/* Botão comprar fixo no mobile */}
      {!hasActiveLicense && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 p-4 backdrop-blur lg:hidden">
          <Button className="w-full" size="lg" asChild>
            <Link
              href={
                user
                  ? `/checkout/${product.id}`
                  : `/auth/login?next=/checkout/${product.id}`
              }
            >
              Comprar — {formatCurrency(product.price)}
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
