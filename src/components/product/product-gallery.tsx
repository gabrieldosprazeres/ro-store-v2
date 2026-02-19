'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GalleryImage {
  id: string
  url: string
  alt: string
}

interface ProductGalleryProps {
  images: GalleryImage[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [current, setCurrent] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg border border-border bg-muted">
        <Package size={48} className="text-muted-foreground" aria-hidden="true" />
      </div>
    )
  }

  const prev = () => setCurrent((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setCurrent((i) => (i === images.length - 1 ? 0 : i + 1))

  return (
    <div>
      {/* Imagem principal */}
      <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
        <Image
          src={images[current].url}
          alt={images[current].alt}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
          priority
        />

        {/* Botões prev/next — apenas quando há mais de 1 imagem */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
              onClick={prev}
              aria-label="Imagem anterior"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
              onClick={next}
              aria-label="Próxima imagem"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </Button>

            {/* Dots indicator */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Imagem ${i + 1}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-200',
                    i === current
                      ? 'w-4 bg-primary'
                      : 'w-1.5 bg-white/50 hover:bg-white/80'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails — desktop */}
      {images.length > 1 && (
        <div className="mt-2 hidden gap-2 sm:flex">
          {images.map((image, i) => (
            <button
              key={image.id}
              onClick={() => setCurrent(i)}
              aria-label={`Selecionar imagem ${i + 1}`}
              className={cn(
                'relative aspect-video w-20 shrink-0 overflow-hidden rounded border transition-all duration-150',
                i === current
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border opacity-60 hover:opacity-100'
              )}
            >
              <Image
                src={image.url}
                alt={`${title} — miniatura ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
