import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...(rest as object)}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string
    alt: string
    [key: string]: unknown
  }) => <img src={src} alt={alt} {...(rest as object)} />,
}))

import { ProductGrid } from '@/components/catalog/product-grid'

// ─── Factory ──────────────────────────────────────────────────────────────────

function createProduct(overrides: Partial<{
  id: string
  slug: string
  title: string
  price: number
  category: string
  emulators: string[]
  thumbnail: string | null
}> = {}) {
  return {
    id: 'prod-1',
    slug: 'test-product',
    title: 'Test Product',
    price: 49.9,
    category: 'PvP',
    emulators: ['rAthena'],
    thumbnail: null,
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProductGrid', () => {
  it('renders an empty state message when no products are provided', () => {
    render(<ProductGrid products={[]} />)
    expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument()
  })

  it('renders a link to clear filters in the empty state', () => {
    render(<ProductGrid products={[]} />)
    const link = screen.getByRole('link', { name: /limpar filtros/i })
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders a card for each product', () => {
    const products = [
      createProduct({ id: 'p1', slug: 'skin-dragon', title: 'Skin Dragon' }),
      createProduct({ id: 'p2', slug: 'plugin-pvp', title: 'Plugin PvP' }),
    ]
    render(<ProductGrid products={products} />)
    expect(screen.getByText('Skin Dragon')).toBeInTheDocument()
    expect(screen.getByText('Plugin PvP')).toBeInTheDocument()
  })

  it('links each card to the product slug', () => {
    render(<ProductGrid products={[createProduct({ slug: 'my-script' })]} />)
    const link = screen.getByRole('link', { name: /my-script|test product/i })
    expect(link).toHaveAttribute('href', '/produtos/my-script')
  })
})
