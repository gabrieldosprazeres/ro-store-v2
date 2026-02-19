import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { YouTubeEmbed } from '@/components/product/youtube-embed'

describe('YouTubeEmbed', () => {
  it('renders an iframe for a youtube.com/watch URL', () => {
    render(<YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Demo" />)
    const iframe = screen.getByTitle(/vídeo/i)
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/dQw4w9WgXcQ')
  })

  it('renders an iframe for a youtu.be short URL', () => {
    render(<YouTubeEmbed url="https://youtu.be/dQw4w9WgXcQ" title="Demo" />)
    const iframe = screen.getByTitle(/vídeo/i)
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/dQw4w9WgXcQ')
  })

  it('renders an iframe for a /embed/ URL', () => {
    render(<YouTubeEmbed url="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Demo" />)
    const iframe = screen.getByTitle(/vídeo/i)
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/dQw4w9WgXcQ')
  })

  it('renders nothing for a non-YouTube URL', () => {
    const { container } = render(
      <YouTubeEmbed url="https://vimeo.com/123456" title="Demo" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing for an invalid URL string', () => {
    const { container } = render(<YouTubeEmbed url="not-a-url" title="Demo" />)
    expect(container.firstChild).toBeNull()
  })

  it('includes the product title in the iframe title attribute', () => {
    render(
      <YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Skin Dragon" />
    )
    const iframe = screen.getByTitle(/Skin Dragon/i)
    expect(iframe).toBeInTheDocument()
  })
})
