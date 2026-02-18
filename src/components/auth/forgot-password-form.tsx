'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, MailCheck } from 'lucide-react'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validators/auth-schema'
import { resetPassword } from '@/lib/actions/auth-actions'
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

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: ResetPasswordInput) {
    setLoading(true)
    const result = await resetPassword(data)
    setLoading(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm space-y-4 text-center">
        <MailCheck className="mx-auto h-12 w-12 text-primary" />
        <h2 className="text-xl font-bold text-foreground">E-mail enviado</h2>
        <p className="text-sm text-muted-foreground">
          Se esse e-mail estiver cadastrado, você receberá um link para redefinir
          sua senha em breve.
        </p>
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
          Redefinir senha
        </h1>
        <p className="text-sm text-muted-foreground">
          Informe seu e-mail para receber o link de redefinição
        </p>
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar link de redefinição
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/auth/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Voltar para o login
        </Link>
      </p>
    </div>
  )
}
