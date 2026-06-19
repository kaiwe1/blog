import type { Metadata } from 'next'
import { Geist, Geist_Mono, Noto_Sans_SC } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/nav'
import { Footer } from '@/components/footer'

// 无衬线体 -> 用于正文
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

// 等宽字体 -> 用于代码块
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// 中文字体 -> Geist 不覆盖中文时 fallback 到此
const notoSansSC = Noto_Sans_SC({
  variable: '--font-noto-sans-sc',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${notoSansSC.variable}`}>
      <head>
        <meta name="baidu-site-verification" content="codeva-rM9NT8JnNc" />
        <link rel="preconnect" href="https://giscus.app" />
        <link rel="preconnect" href="https://api.github.com" />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
      </head>
      <body className="font-sans">
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  )
}