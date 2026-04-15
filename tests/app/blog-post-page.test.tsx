import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a href={typeof href === 'string' ? href : ''} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: ({ source }: { source: string }) => <div>{source}</div>,
}))

vi.mock('@/lib/posts', () => ({
  getAllPosts: vi.fn(),
  getPostBySlug: vi.fn(),
  getPostsBySeriesSlug: vi.fn(),
}))

import BlogPost, { generateStaticParams } from '@/app/blog/[slug]/page'
import { getAllPosts, getPostBySlug, getPostsBySeriesSlug } from '@/lib/posts'

describe('blog post page', () => {
  beforeEach(() => {
    vi.mocked(getAllPosts).mockReturnValue([{ slug: 'hello-world' } as never])
    vi.mocked(getPostBySlug).mockReturnValue({
      slug: 'hello-world',
      title: 'Hello, World!',
      date: 'April 4, 2026',
      excerpt: 'Welcome to my new blog built with Next.js SSG and MDX.',
      content: '# Hello',
      series: {
        name: 'Blog Basics',
        slug: 'blog-basics',
        order: 1,
      },
      tags: [
        { name: 'Next.js', slug: 'next-js' },
        { name: 'MDX', slug: 'mdx' },
      ],
    })
    vi.mocked(getPostsBySeriesSlug).mockReturnValue([
      {
        slug: 'hello-world',
        title: 'Hello, World!',
        date: 'April 4, 2026',
        excerpt: 'Welcome to my new blog built with Next.js SSG and MDX.',
        content: '# Hello',
        series: {
          name: 'Blog Basics',
          slug: 'blog-basics',
          order: 1,
        },
        tags: [],
      },
      {
        slug: 'next-steps',
        title: 'Next Steps',
        date: 'April 5, 2026',
        excerpt: 'Where the series goes next.',
        content: '# Next',
        series: {
          name: 'Blog Basics',
          slug: 'blog-basics',
          order: 2,
        },
        tags: [],
      },
    ])
  })

  it('generates static params from post slugs', () => {
    expect(generateStaticParams()).toEqual([{ slug: 'hello-world' }])
  })

  it('renders taxonomy metadata and series navigation', async () => {
    const page = await BlogPost({ params: Promise.resolve({ slug: 'hello-world' }) })

    render(page)

    expect(screen.getByRole('link', { name: /blog basics/i })).toHaveAttribute('href', '/series/blog-basics')
    expect(screen.getByRole('link', { name: /next\.js/i })).toHaveAttribute('href', '/tags/next-js')
    expect(screen.getByRole('link', { name: /^mdx$/i })).toHaveAttribute('href', '/tags/mdx')
    expect(screen.getByRole('heading', { name: /this series/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /next steps/i })).toHaveAttribute('href', '/blog/next-steps')
    expect(screen.getAllByText(/part 1/i)).toHaveLength(1)
    expect(screen.getByText(/current/i)).toBeInTheDocument()
  })
})
