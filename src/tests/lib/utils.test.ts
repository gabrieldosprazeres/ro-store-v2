import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatDateTime, getImageUrl } from '@/lib/utils'

// ─── formatCurrency ────────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats a positive number as BRL currency', () => {
    const result = formatCurrency(49.9)
    expect(result).toMatch(/R\$/)
    expect(result).toMatch(/49/)
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toMatch(/0/)
  })

  it('formats a large value with thousands separator', () => {
    const result = formatCurrency(1000)
    expect(result).toMatch(/1\.000|1,000/)
  })
})

// ─── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats a date string as dd/mm/yyyy', () => {
    // Using UTC noon to avoid timezone edge cases on any machine
    const result = formatDate('2024-03-15T12:00:00Z')
    expect(result).toMatch(/15/)
    expect(result).toMatch(/03/)
    expect(result).toMatch(/2024/)
  })

  it('accepts a Date object', () => {
    const date = new Date('2024-07-04T12:00:00Z')
    const result = formatDate(date)
    expect(result).toMatch(/2024/)
  })
})

// ─── formatDateTime ───────────────────────────────────────────────────────────

describe('formatDateTime', () => {
  it('includes date and time in the output', () => {
    const result = formatDateTime('2024-06-20T14:30:00Z')
    expect(result).toMatch(/2024/)
    // Time portion — two digits separated by colon
    expect(result).toMatch(/\d{2}:\d{2}/)
  })
})

// ─── getImageUrl ──────────────────────────────────────────────────────────────

describe('getImageUrl', () => {
  it('combines the base URL and storage path correctly', () => {
    const original = process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'

    const result = getImageUrl('products/image.jpg')

    expect(result).toBe(
      'https://test.supabase.co/storage/v1/object/public/product-media/products/image.jpg'
    )

    process.env.NEXT_PUBLIC_SUPABASE_URL = original
  })

  it('returns the storage path segment even when env var is not set', () => {
    const original = process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_URL

    const result = getImageUrl('products/image.jpg')

    expect(result).toContain('/storage/v1/object/public/product-media/products/image.jpg')

    process.env.NEXT_PUBLIC_SUPABASE_URL = original
  })
})
