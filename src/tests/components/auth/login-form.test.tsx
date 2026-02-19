import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockGet = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => ({ get: mockGet }),
}))

const mockSignIn = vi.fn()
vi.mock('@/lib/actions/auth-actions', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
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

// Import AFTER mocks are defined
import { LoginForm } from '@/components/auth/login-form'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup()
  await user.type(screen.getByPlaceholderText('seu@email.com'), email)
  await user.type(screen.getByPlaceholderText('••••••••'), password)
  await user.click(screen.getByRole('button', { name: /^entrar$/i }))
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReturnValue(null)
  })

  it('renders email input, password input, and submit button', () => {
    render(<LoginForm />)
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^entrar$/i })).toBeInTheDocument()
  })

  it('renders the forgot password link', () => {
    render(<LoginForm />)
    expect(screen.getByText(/esqueci minha senha/i)).toBeInTheDocument()
  })

  it('renders the register link', () => {
    render(<LoginForm />)
    expect(screen.getByText(/criar conta/i)).toBeInTheDocument()
  })

  it('blocks form submission when email is invalid (validation guard)', async () => {
    // Ensure signIn has a safe default so we can detect if it was called
    mockSignIn.mockResolvedValue({ success: false, error: 'noop' })

    render(<LoginForm />)
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('seu@email.com'), 'not-an-email')
    await user.type(screen.getByPlaceholderText('••••••••'), 'secret')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    // Give RHF time to run validation
    await new Promise((r) => setTimeout(r, 300))

    // signIn must NOT be called — validation blocked submission
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('calls signIn with typed credentials on submit', async () => {
    mockSignIn.mockResolvedValue({ success: true, data: undefined })

    render(<LoginForm />)
    await fillAndSubmit('user@example.com', 'mypassword')

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'mypassword',
      })
    })
  })

  it('redirects to / on successful login with no returnUrl', async () => {
    mockSignIn.mockResolvedValue({ success: true, data: undefined })
    mockGet.mockReturnValue(null)

    render(<LoginForm />)
    await fillAndSubmit('user@example.com', 'mypassword')

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('redirects to returnUrl when it is a safe relative path', async () => {
    mockSignIn.mockResolvedValue({ success: true, data: undefined })
    mockGet.mockReturnValue('/dashboard')

    render(<LoginForm />)
    await fillAndSubmit('user@example.com', 'mypassword')

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('redirects to / when returnUrl is a protocol-relative URL (open redirect guard)', async () => {
    mockSignIn.mockResolvedValue({ success: true, data: undefined })
    mockGet.mockReturnValue('//evil.com')

    render(<LoginForm />)
    await fillAndSubmit('user@example.com', 'mypassword')

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
      expect(mockPush).not.toHaveBeenCalledWith('//evil.com')
    })
  })

  it('shows error toast on failed login', async () => {
    mockSignIn.mockResolvedValue({ success: false, error: 'E-mail ou senha incorretos' })

    render(<LoginForm />)
    await fillAndSubmit('user@example.com', 'wrongpassword')

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('E-mail ou senha incorretos')
    })
  })

  it('disables the submit button while loading', async () => {
    let resolve: (v: unknown) => void
    mockSignIn.mockReturnValue(new Promise((r) => { resolve = r }))

    render(<LoginForm />)
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('seu@email.com'), 'user@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'mypassword')

    const submitBtn = screen.getByRole('button', { name: /^entrar$/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(submitBtn).toBeDisabled()
    })

    resolve!({ success: true, data: undefined })
  })
})
