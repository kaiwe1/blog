import { describe, expect, it } from 'vitest'
import {
  getAllPosts,
  getAllSeries,
  getAllTags,
  getPostBySlug,
  getPostsBySeriesSlug,
  getPostsByTagSlug,
  getSeriesBySlug,
  getTagBySlug,
  slugifyTaxonomy,
} from '@/lib/posts'

describe('post taxonomy parsing', () => {
  it('normalizes series and tags on a post', () => {
    const post = getPostBySlug('hello-world')

    expect(post.series).toEqual({
      name: 'Blog Basics',
      slug: 'blog-basics',
      order: 1,
    })
    expect(post.tags).toEqual([
      { name: 'Next.js', slug: 'next-js' },
      { name: 'MDX', slug: 'mdx' },
    ])
  })

  it('slugifies human-readable taxonomy names', () => {
    expect(slugifyTaxonomy(' Frontend System Design ')).toBe('frontend-system-design')
    expect(slugifyTaxonomy('Next.js')).toBe('next-js')
    expect(slugifyTaxonomy('C++')).toBe('c')
  })

  it('builds series aggregates', () => {
    expect(getAllSeries()).toEqual([
      {
        name: 'Blog Basics',
        slug: 'blog-basics',
        count: 1,
      },
    ])
    expect(getSeriesBySlug('blog-basics')).toEqual({
      name: 'Blog Basics',
      slug: 'blog-basics',
      count: 1,
    })
    expect(getPostsBySeriesSlug('blog-basics').map((post) => post.slug)).toEqual(['hello-world'])
  })

  it('builds tag aggregates', () => {
    expect(getAllTags()).toEqual([
      { name: 'MDX', slug: 'mdx', count: 1 },
      { name: 'Next.js', slug: 'next-js', count: 1 },
    ])
    expect(getTagBySlug('next-js')).toEqual({
      name: 'Next.js',
      slug: 'next-js',
      count: 1,
    })
    expect(getPostsByTagSlug('mdx').map((post) => post.slug)).toEqual(['hello-world'])
  })

  it('keeps the global posts list available', () => {
    expect(getAllPosts().some((post) => post.slug === 'hello-world')).toBe(true)
  })
})
