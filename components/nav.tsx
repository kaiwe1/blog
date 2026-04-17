'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/', label: 'home' },
  { href: '/about', label: 'about' },
  { href: '/now', label: 'now' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="max-w-xl mx-auto px-6 py-6 border-b border-neutral-200">
      {NAV_LINKS.map((link, index) => (
        <span key={link.href}>
          <Link
            href={link.href}
            className={`text-sm ${
              pathname === link.href
                ? 'text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {link.label}
          </Link>
          {index < NAV_LINKS.length - 1 && <span className="text-neutral-300 mx-3">/</span>}
        </span>
      ))}
    </nav>
  )
}
