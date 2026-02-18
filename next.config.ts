import type { NextConfig } from 'next'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
let supabaseHost = ''
try {
  if (supabaseUrl) supabaseHost = new URL(supabaseUrl).host
} catch {
  // Env var não configurada ainda — ok em desenvolvimento
}

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      supabaseHost
        ? `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`
        : "connect-src 'self'",
      "img-src 'self' data: https:",
      "frame-src https://www.youtube.com",
      "font-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  // Cache explícito com "use cache" + cacheLife (Next.js 16)
  cacheComponents: true,

  // Turbopack é o bundler padrão no Next.js 16
  // (sem flags necessárias)

  // Imagens remotas — remotePatterns (images.domains foi depreciado)
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: 'https' as const, hostname: supabaseHost }]
        : [{ protocol: 'https' as const, hostname: '*.supabase.co' }]),
    ],
  },

  // Headers de segurança em todas as rotas
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
