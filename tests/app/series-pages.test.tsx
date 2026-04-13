import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a href={typeof href === 'string' ? href : ''} {...props}>
      {children}
    </a>
  ),
}))

const { notFound } = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('next/navigation', () => ({
  notFound,
}))

vi.mock('@/lib/posts', () => ({
  getAllSeries: vi.fn(),
  getPostsBySeriesSlug: vi.fn(),
  getSeriesBySlug: vi.fn(),
}))

import SeriesIndexPage from '@/app/series/page'
import SeriesPage, { generateStaticParams } from '@/app/series/[series]/page'
import { getAllSeries, getPostsBySeriesSlug, getSeriesBySlug } from '@/lib/posts'

describe('series pages', () => {
  beforeEach(() => {
    notFound.mockClear()
    vi.mocked(getAllSeries).mockReturnValue([
      { name: 'Blog Basics', slug: 'blog-basics', count: 2 },
    ])
    vi.mocked(getSeriesBySlug).mockImplementation((slug) =>
      slug === 'blog-basics' ? { name: 'Blog Basics', slug: 'blog-basics', count: 2 } : undefined
    )
    vi.mocked(getPostsBySeriesSlug).mockReturnValue([
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
        tags: [],
      },
      {
        slug: 'next-steps',
        title: 'Next Steps',
        date: 'April 5, 2026',
        excerpt: 'Where the series goes next.',
        content: 'content',
        series: {
          name: 'Blog Basics',
          slug: 'blog-basics',
          order: 2,
        },
        tags: [],
      },
    ])
  })

  it('renders the series index', () => {
    render(<SeriesIndexPage />)

    expect(screen.getByRole('link', { name: /blog basics/i })).toHaveAttribute('href', '/series/blog-basics')
    expect(screen.getByText(/2 posts/i)).toBeInTheDocument()
  })

  it('renders a series detail page', async () => {
    const page = await SeriesPage({ params: Promise.resolve({ series: 'blog-basics' }) })

    render(page)

    expect(screen.getByRole('heading', { name: /blog basics/i })).toBeInTheDocument()
    expect(screen.getByText(/part 1/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /hello, world!/i })).toHaveAttribute('href', '/blog/hello-world')
  })

  it('generates static params from all series', () => {
    expect(generateStaticParams()).toEqual([{ series: 'blog-basics' }])
  })

  it('returns not found for unknown series slugs', async () => {
    vi.mocked(getSeriesBySlug).mockReturnValueOnce(undefined)

    await expect(SeriesPage({ params: Promise.resolve({ series: 'missing-series' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND'
    )
    expect(notFound).toHaveBeenCalled()
  })
})
