'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Drawer } from 'vaul'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const CATEGORIES = ['PvP', 'PvE', 'Quest', 'Visual', 'Econômico', 'Sistema']
const EMULATORS = ['rAthena', 'Hercules']

interface CatalogFiltersProps {
  selectedCategories: string[]
  selectedEmulators: string[]
  mobile?: boolean
}

interface FilterPanelProps {
  selectedCategories: string[]
  selectedEmulators: string[]
  onCategoryChange: (category: string, checked: boolean) => void
  onEmulatorChange: (emulator: string, checked: boolean) => void
  onClear: () => void
  onApply?: () => void
  showApply?: boolean
}

function FilterPanel({
  selectedCategories,
  selectedEmulators,
  onCategoryChange,
  onEmulatorChange,
  onClear,
  onApply,
  showApply,
}: FilterPanelProps) {
  return (
    <div className="space-y-5">
      {/* Categoria */}
      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">Categoria</p>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) =>
                  onCategoryChange(category, checked === true)
                }
              />
              <Label
                htmlFor={`category-${category}`}
                className="cursor-pointer text-sm font-normal text-muted-foreground"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Emulador */}
      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">Emulador</p>
        <div className="space-y-2">
          {EMULATORS.map((emulator) => (
            <div key={emulator} className="flex items-center gap-2">
              <Checkbox
                id={`emulator-${emulator}`}
                checked={selectedEmulators.includes(emulator)}
                onCheckedChange={(checked) =>
                  onEmulatorChange(emulator, checked === true)
                }
              />
              <Label
                htmlFor={`emulator-${emulator}`}
                className="cursor-pointer text-sm font-normal text-muted-foreground"
              >
                {emulator}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {showApply && (
        <>
          <Separator />
          <div className="space-y-2">
            <Button className="w-full" onClick={onApply}>
              Aplicar filtros
            </Button>
            <Button variant="ghost" className="w-full" onClick={onClear}>
              Limpar filtros
            </Button>
          </div>
        </>
      )}

      {!showApply && (
        <Button variant="ghost" size="sm" className="w-full" onClick={onClear}>
          Limpar filtros
        </Button>
      )}
    </div>
  )
}

export function CatalogFilters({
  selectedCategories,
  selectedEmulators,
  mobile = false,
}: CatalogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Estado local temporário para o drawer mobile (só aplica ao clicar "Aplicar")
  const [draftCategories, setDraftCategories] = useState<string[]>(selectedCategories)
  const [draftEmulators, setDraftEmulators] = useState<string[]>(selectedEmulators)

  const navigate = useCallback(
    (categories: string[], emulators: string[]) => {
      const params = new URLSearchParams(searchParams.toString())
      if (categories.length > 0) {
        params.set('categories', categories.join(','))
      } else {
        params.delete('categories')
      }
      if (emulators.length > 0) {
        params.set('emulators', emulators.join(','))
      } else {
        params.delete('emulators')
      }
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, searchParams]
  )

  // Desktop: atualiza URL imediatamente ao mudar checkbox
  const handleDesktopCategoryChange = (category: string, checked: boolean) => {
    const next = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter((c) => c !== category)
    navigate(next, selectedEmulators)
  }

  const handleDesktopEmulatorChange = (emulator: string, checked: boolean) => {
    const next = checked
      ? [...selectedEmulators, emulator]
      : selectedEmulators.filter((e) => e !== emulator)
    navigate(selectedCategories, next)
  }

  const handleDesktopClear = () => navigate([], [])

  // Mobile: atualiza estado local, aplica ao clicar "Aplicar"
  const handleMobileCategoryChange = (category: string, checked: boolean) => {
    setDraftCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    )
  }

  const handleMobileEmulatorChange = (emulator: string, checked: boolean) => {
    setDraftEmulators((prev) =>
      checked ? [...prev, emulator] : prev.filter((e) => e !== emulator)
    )
  }

  const handleMobileApply = () => {
    navigate(draftCategories, draftEmulators)
    setDrawerOpen(false)
  }

  const handleMobileClear = () => {
    setDraftCategories([])
    setDraftEmulators([])
    navigate([], [])
    setDrawerOpen(false)
  }

  // Modo mobile: renderiza apenas o botão + Vaul drawer
  if (mobile) {
    const activeCount = selectedCategories.length + selectedEmulators.length
    return (
      <Drawer.Root
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open)
          if (open) {
            // Sincroniza draft com estado atual ao abrir
            setDraftCategories(selectedCategories)
            setDraftEmulators(selectedEmulators)
          }
        }}
      >
        <Drawer.Trigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filtros
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl border-t border-border bg-card">
            {/* Drag handle */}
            <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <Drawer.Title className="text-base font-semibold text-foreground">
                Filtros
              </Drawer.Title>
              <Drawer.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Fechar filtros">
                  <X size={20} aria-hidden="true" />
                </Button>
              </Drawer.Close>
            </div>

            <Separator />

            {/* Conteúdo dos filtros */}
            <div className="overflow-y-auto px-4 py-4 pb-8">
              <FilterPanel
                selectedCategories={draftCategories}
                selectedEmulators={draftEmulators}
                onCategoryChange={handleMobileCategoryChange}
                onEmulatorChange={handleMobileEmulatorChange}
                onClear={handleMobileClear}
                onApply={handleMobileApply}
                showApply
              />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  // Modo desktop: sidebar inline
  return (
    <FilterPanel
      selectedCategories={selectedCategories}
      selectedEmulators={selectedEmulators}
      onCategoryChange={handleDesktopCategoryChange}
      onEmulatorChange={handleDesktopEmulatorChange}
      onClear={handleDesktopClear}
    />
  )
}
