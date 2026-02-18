import { CheckoutHeader } from '@/components/layouts/checkout-header'

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CheckoutHeader />
      <main className="flex flex-1 items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  )
}
