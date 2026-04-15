import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a href={typeof href === 'string' ? href : ''} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/lib/posts', () => ({
  getAllPosts: vi.fn(),
}))

import Home from '@/app/page'
import { getAllPosts } from '@/lib/posts'

describe('home page', () => {
  beforeEach(() => {
    vi.mocked(getAllPosts).mockReturnValue([
      {
        slug: 'hello-world',
        title: 'Hello, World!',
        date: 'April 4, 2026',
        excerpt: 'Welcome to my new blog built with Next.js SSG and MDX.',
        content: 'content',
        series: {
          name: 'Blog Basics',
          slug: 'blog-basics',
          order: 1,
        },
        tags: [
          { name: 'Next.js', slug: 'next-js' },
          { name: 'MDX', slug: 'mdx' },
        ],
      },
    ])
  })

  it('renders post taxonomy metadata', () => {
    render(<Home />)

    expect(screen.getByRole('link', { name: /hello, world!/i })).toHaveAttribute('href', '/blog/hello-world')
    expect(screen.getByRole('link', { name: /blog basics/i })).toHaveAttribute('href', '/series/blog-basics')
    expect(screen.getByRole('link', { name: /next\.js/i })).toHaveAttribute('href', '/tags/next-js')
    expect(screen.getByRole('link', { name: /^mdx$/i })).toHaveAttribute('href', '/tags/mdx')
    expect(screen.getByText(/Welcome to my new blog built with Next.js SSG and MDX./i)).toBeInTheDocument()
  })
})
