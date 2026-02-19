'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ActiveFiltersProps {
  selectedCategories: string[]
  selectedEmulators: string[]
}

export function ActiveFilters({ selectedCategories, selectedEmulators }: ActiveFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const remove = (type: 'categories' | 'emulators', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const current = type === 'categories' ? selectedCategories : selectedEmulators
    const next = current.filter((v) => v !== value)
    if (next.length > 0) {
      params.set(type, next.join(','))
    } else {
      params.delete(type)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const hasFilters = selectedCategories.length > 0 || selectedEmulators.length > 0

  if (!hasFilters) return null

  return (
    <div className="flex flex-wrap gap-2">
      {selectedCategories.map((category) => (
        <Badge
          key={`cat-${category}`}
          variant="secondary"
          className="gap-1 pr-1 text-xs"
        >
          {category}
          <button
            onClick={() => remove('categories', category)}
            aria-label={`Remover filtro ${category}`}
            className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-muted-foreground/20"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </Badge>
      ))}

      {selectedEmulators.map((emulator) => (
        <Badge
          key={`emu-${emulator}`}
          variant="outline"
          className="gap-1 pr-1 text-xs"
        >
          {emulator}
          <button
            onClick={() => remove('emulators', emulator)}
            aria-label={`Remover filtro ${emulator}`}
            className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-muted-foreground/20"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </Badge>
      ))}
    </div>
  )
}
