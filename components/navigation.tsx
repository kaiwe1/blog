'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'

const NAV_LINKS = [
  { href: '/', label: 'home' },
  { href: '/about', label: 'about' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="max-w-2xl mx-auto px-6 py-6 border-b border-border flex items-center justify-between">
      <div>
        {NAV_LINKS.map((link, index) => (
          <span key={link.href}>
            <Link
              href={link.href}
              className={`text-sm ${
                pathname === link.href
                  ? 'text-text font-semibold'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              {link.label}
            </Link>
            {index < NAV_LINKS.length - 1 && <span className="text-text-muted mx-3">/</span>}
          </span>
        ))}
      </div>
      <ThemeToggle />
    </nav>
  )
}
