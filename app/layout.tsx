import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Playfair_Display } from 'next/font/google'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import NotificationListener from '@/components/NotificationListener'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'MAKHARINSKIY',
  description: 'Shopping, schedule, tasks and chat',
  applicationName: 'MAKHARINSKIY',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'MAKHARINSKIY',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [{ url: '/logo-icon.png', type: 'image/png' }],
    apple: '/logo-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${geist.variable} ${playfair.variable}`}>
      <body className="relative min-h-svh antialiased bg-black text-neutral-100 overflow-x-hidden">
        
        {/* Layer 1: Subtle smoky burgundy radial gradient base */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(65,10,20,0.45)_0%,rgba(10,5,8,0.85)_60%,rgba(0,0,0,1)_100%)] pointer-events-none z-0" />

        {/* Layer 2: Soft blurred red light in two corners */}
        <div className="fixed -top-32 -left-32 w-[450px] h-[450px] bg-red-950/30 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="fixed -bottom-32 -right-32 w-[450px] h-[450px] bg-red-900/20 rounded-full blur-[140px] pointer-events-none z-0" />

        {/* Layer 3: Faint glass-like texture & barely visible gold accents */}
        <div className="fixed inset-0 bg-neutral-950/30 backdrop-blur-[2px] border border-amber-500/[0.03] pointer-events-none z-0" />

        {/* Main Application Container */}
        <div className="relative z-10 flex min-h-svh flex-col">
          <NotificationListener />
          {children}
          <ServiceWorkerRegister />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </div>

      </body>
    </html>
  )
}
