import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/nav'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Kaiwei Zhang',
  description: 'tilog',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="baidu-site-verification" content="codeva-rM9NT8JnNc" />
      </head>
      <body>
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  )
}