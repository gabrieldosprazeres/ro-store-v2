import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { SiteHeader } from '@/components/layouts/site-header'
import { SiteFooter } from '@/components/layouts/site-footer'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Defesa em profundidade além do proxy.ts
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
