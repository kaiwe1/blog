import type { Metadata } from 'next'
import { Geist, Geist_Mono, Noto_Sans_SC } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/navigation'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from '@vercel/analytics/next'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const notoSansSC = Noto_Sans_SC({
  variable: '--font-noto-sans-sc',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'Kaiwei Zhang',
  description: 'My Personal Blog. Indie Hacking, Programming and Life.',
}

const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme');
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})()
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${notoSansSC.variable}`}>
      <head>
        <meta name="baidu-site-verification" content="codeva-rM9NT8JnNc" />
        <link rel="preconnect" href="https://giscus.app" />
        <link rel="preconnect" href="https://api.github.com" />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans bg-bg text-text">
        <ThemeProvider>
          <Navigation />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
