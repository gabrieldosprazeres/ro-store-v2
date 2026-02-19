import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
}))

const mockSignUp = vi.fn()
vi.mock('@/lib/actions/auth-actions', () => ({
  signUp: (...args: unknown[]) => mockSignUp(...args),
}))

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: { signInWithOAuth: vi.fn() },
  }),
}))

const mockToastError = vi.fn()
vi.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}))

// Import AFTER mocks
import { RegisterForm } from '@/components/auth/register-form'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fillAndSubmit(email: string, password: string, confirmPassword: string) {
  const user = userEvent.setup()
  await user.type(screen.getByPlaceholderText('seu@email.com'), email)
  await user.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), password)
  // confirmPassword field has placeholder ••••••••
  const passwordInputs = screen.getAllByPlaceholderText('••••••••')
  await user.type(passwordInputs[0], confirmPassword)
  await user.click(screen.getByRole('button', { name: /criar conta/i }))
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all form fields and the submit button', () => {
    render(<RegisterForm />)
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Mínimo 8 caracteres')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument()
  })

  it('renders the login link', () => {
    render(<RegisterForm />)
    expect(screen.getByRole('link', { name: /^entrar$/i })).toBeInTheDocument()
  })

  it('calls signUp with typed data on submit', async () => {
    mockSignUp.mockResolvedValue({
      success: true,
      data: { message: 'Verifique seu e-mail para confirmar o cadastro.' },
    })

    render(<RegisterForm />)
    await fillAndSubmit('new@example.com', 'password123', 'password123')

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
    })
  })

  it('shows success state after successful signup', async () => {
    mockSignUp.mockResolvedValue({
      success: true,
      data: { message: 'Verifique seu e-mail para confirmar o cadastro.' },
    })

    render(<RegisterForm />)
    await fillAndSubmit('new@example.com', 'password123', 'password123')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /verifique seu e-mail/i })).toBeInTheDocument()
    })
  })

  it('shows error toast on failed signup', async () => {
    mockSignUp.mockResolvedValue({
      success: false,
      error: 'Não foi possível criar a conta. Tente novamente.',
    })

    render(<RegisterForm />)
    await fillAndSubmit('existing@example.com', 'password123', 'password123')

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        'Não foi possível criar a conta. Tente novamente.',
      )
    })
  })

  it('shows validation error when passwords do not match', async () => {
    render(<RegisterForm />)
    await fillAndSubmit('new@example.com', 'password123', 'differentpass')

    await waitFor(() => {
      expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when password is too short', async () => {
    render(<RegisterForm />)
    await fillAndSubmit('new@example.com', 'short12', 'short12')

    await waitFor(() => {
      expect(screen.getByText(/pelo menos 8 caracteres/i)).toBeInTheDocument()
    })
  })

  it('disables submit button while loading', async () => {
    let resolve: (v: unknown) => void
    mockSignUp.mockReturnValue(new Promise((r) => { resolve = r }))

    render(<RegisterForm />)
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('seu@email.com'), 'new@example.com')
    await user.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'password123')
    const passwordInputs = screen.getAllByPlaceholderText('••••••••')
    await user.type(passwordInputs[0], 'password123')

    const submitBtn = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(submitBtn).toBeDisabled()
    })

    resolve!({ success: true, data: { message: 'ok' } })
  })
})
