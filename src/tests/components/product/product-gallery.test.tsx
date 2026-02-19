import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// next/image renders as a plain img in tests
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

import { ProductGallery } from '@/components/product/product-gallery'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeImages(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    url: `https://cdn.test/img${i + 1}.jpg`,
    alt: `Produto imagem ${i + 1}`,
  }))
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProductGallery', () => {
  it('renders a placeholder when no images are provided', () => {
    render(<ProductGallery images={[]} title="Test Product" />)
    // No img element should be in the document — only the Package icon placeholder
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders the first image as the main image', () => {
    const images = makeImages(1)
    render(<ProductGallery images={images} title="Test Product" />)
    expect(screen.getByAltText('Produto imagem 1')).toBeInTheDocument()
  })

  it('does not render navigation buttons when only one image is provided', () => {
    render(<ProductGallery images={makeImages(1)} title="Test Product" />)
    expect(screen.queryByLabelText('Imagem anterior')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Próxima imagem')).not.toBeInTheDocument()
  })

  it('renders navigation buttons when multiple images are provided', () => {
    render(<ProductGallery images={makeImages(2)} title="Test Product" />)
    expect(screen.getByLabelText('Imagem anterior')).toBeInTheDocument()
    expect(screen.getByLabelText('Próxima imagem')).toBeInTheDocument()
  })

  it('advances to the next image when the next button is clicked', async () => {
    const user = userEvent.setup()
    const images = makeImages(2)
    render(<ProductGallery images={images} title="Test Product" />)

    await user.click(screen.getByLabelText('Próxima imagem'))

    // The first img in the DOM is the main image — it should now point to img2
    const allImgs = screen.getAllByRole('img')
    expect(allImgs[0]).toHaveAttribute('src', 'https://cdn.test/img2.jpg')
  })

  it('wraps around to the last image when the prev button is clicked from the first image', async () => {
    const user = userEvent.setup()
    const images = makeImages(3)
    render(<ProductGallery images={images} title="Test Product" />)

    // Clicking prev from index 0 should go to index 2 (last)
    await user.click(screen.getByLabelText('Imagem anterior'))

    const allImgs = screen.getAllByRole('img')
    expect(allImgs[0]).toHaveAttribute('src', 'https://cdn.test/img3.jpg')
  })

  it('renders dot indicators for each image', () => {
    render(<ProductGallery images={makeImages(3)} title="Test Product" />)
    expect(screen.getByLabelText('Imagem 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Imagem 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Imagem 3')).toBeInTheDocument()
  })
})
