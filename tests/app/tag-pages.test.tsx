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
  getAllTags: vi.fn(),
  getPostsByTagSlug: vi.fn(),
  getTagBySlug: vi.fn(),
}))

import TagsIndexPage from '@/app/tags/page'
import TagPage, { generateStaticParams } from '@/app/tags/[tag]/page'
import { getAllTags, getPostsByTagSlug, getTagBySlug } from '@/lib/posts'

describe('tag pages', () => {
  beforeEach(() => {
    notFound.mockClear()
    vi.mocked(getAllTags).mockReturnValue([
      { name: 'Next.js', slug: 'next-js', count: 2 },
    ])
    vi.mocked(getTagBySlug).mockImplementation((slug) =>
      slug === 'next-js' ? { name: 'Next.js', slug: 'next-js', count: 2 } : undefined
    )
    vi.mocked(getPostsByTagSlug).mockReturnValue([
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
        tags: [{ name: 'Next.js', slug: 'next-js' }],
      },
    ])
  })

  it('renders the tags index', () => {
    render(<TagsIndexPage />)

    expect(screen.getByRole('link', { name: /next\.js/i })).toHaveAttribute('href', '/tags/next-js')
    expect(screen.getByText(/2 posts/i)).toBeInTheDocument()
  })

  it('renders a tag detail page', async () => {
    const page = await TagPage({ params: Promise.resolve({ tag: 'next-js' }) })

    render(page)

    expect(screen.getByRole('heading', { name: /next\.js/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /hello, world!/i })).toHaveAttribute('href', '/blog/hello-world')
    expect(screen.getByRole('link', { name: /blog basics/i })).toHaveAttribute('href', '/series/blog-basics')
  })

  it('generates static params from all tags', () => {
    expect(generateStaticParams()).toEqual([{ tag: 'next-js' }])
  })

  it('returns not found for unknown tag slugs', async () => {
    vi.mocked(getTagBySlug).mockReturnValueOnce(undefined)

    await expect(TagPage({ params: Promise.resolve({ tag: 'missing-tag' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })
})
