import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from '@/lib/validators/auth-schema'

// ─── loginSchema ──────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'secret' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain('email')
    }
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain('password')
    }
  })

  it('rejects missing email', () => {
    const result = loginSchema.safeParse({ password: 'secret' })
    expect(result.success).toBe(false)
  })
})

// ─── registerSchema ───────────────────────────────────────────────────────────

describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      email: 'new@example.com',
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain('password')
    }
  })

  it('rejects mismatching passwords', () => {
    const result = registerSchema.safeParse({
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'different123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain('confirmPassword')
    }
  })

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'bad-email',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('exact 8-character password is accepted', () => {
    const result = registerSchema.safeParse({
      email: 'new@example.com',
      password: 'exactly8',
      confirmPassword: 'exactly8',
    })
    expect(result.success).toBe(true)
  })
})

// ─── resetPasswordSchema ──────────────────────────────────────────────────────

describe('resetPasswordSchema', () => {
  it('accepts valid email', () => {
    const result = resetPasswordSchema.safeParse({ email: 'user@example.com' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = resetPasswordSchema.safeParse({ email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects empty email', () => {
    const result = resetPasswordSchema.safeParse({ email: '' })
    expect(result.success).toBe(false)
  })
})

// ─── updatePasswordSchema ─────────────────────────────────────────────────────

describe('updatePasswordSchema', () => {
  it('accepts valid new password', () => {
    const result = updatePasswordSchema.safeParse({
      password: 'newpassword1',
      confirmPassword: 'newpassword1',
    })
    expect(result.success).toBe(true)
  })

  it('rejects password shorter than 8 characters', () => {
    const result = updatePasswordSchema.safeParse({
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('rejects mismatching passwords', () => {
    const result = updatePasswordSchema.safeParse({
      password: 'newpassword1',
      confirmPassword: 'different123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain('confirmPassword')
    }
  })
})
