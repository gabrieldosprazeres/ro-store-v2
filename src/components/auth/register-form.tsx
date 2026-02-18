'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, MailCheck } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/validators/auth-schema'
import { signUp } from '@/lib/actions/auth-actions'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { OAuthButton } from '@/components/auth/oauth-button'
import { Separator } from '@/components/ui/separator'

export function RegisterForm() {
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('next') ?? undefined
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(data: RegisterInput) {
    setLoading(true)
    const result = await signUp(data)
    setLoading(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setSuccessMessage(result.data.message)
  }

  if (successMessage) {
    return (
      <div className="w-full max-w-sm space-y-4 text-center">
        <MailCheck className="mx-auto h-12 w-12 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Verifique seu e-mail</h2>
        <p className="text-sm text-muted-foreground">{successMessage}</p>
        <Link href="/auth/login" className="text-sm text-primary hover:underline">
          Voltar para o login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Criar conta
        </h1>
        <p className="text-sm text-muted-foreground">
          Crie sua conta para comprar mods para RO
        </p>
      </div>

      <OAuthButton />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">ou</span>
        <Separator className="flex-1" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar conta
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link
          href="/auth/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  )
}
