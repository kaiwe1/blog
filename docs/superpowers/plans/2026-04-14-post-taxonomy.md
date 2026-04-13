# Post Taxonomy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `series` and `tags` post metadata, render that metadata on the home and post pages, and create the `/series`, `/series/[series]`, `/tags`, and `/tags/[tag]` routes.

**Architecture:** Keep content parsing, normalization, and taxonomy aggregation centralized in `lib/posts.ts`, then keep route files and shared components focused on presentation. Introduce a minimal Vitest-based test setup so the data layer and route rendering can follow a real red-green-refactor workflow.

**Tech Stack:** Next.js App Router, TypeScript, MDX via `gray-matter` and `next-mdx-remote`, Tailwind CSS, Vitest, React Testing Library

---

## File Structure

### Existing files to modify

- `package.json` - add test scripts and test dependencies
- `tsconfig.json` - ensure test files are included and Vitest globals types are available
- `lib/posts.ts` - normalize frontmatter, generate taxonomy slugs, expose aggregate helpers
- `app/page.tsx` - show series and tags for each post card
- `app/blog/[slug]/page.tsx` - show taxonomy metadata and series navigation for each post
- `content/posts/hello-world.mdx` - seed one post with taxonomy metadata for real rendering coverage

### New files to create

- `vitest.config.ts` - Vitest config with jsdom environment and alias support
- `vitest.setup.ts` - Testing Library setup
- `components/post-taxonomy.tsx` - shared renderer for series and tags metadata
- `app/series/page.tsx` - series index page
- `app/series/[series]/page.tsx` - per-series page with static params and 404 handling
- `app/tags/page.tsx` - tag index page
- `app/tags/[tag]/page.tsx` - per-tag page with static params and 404 handling
- `tests/lib/posts.test.ts` - unit tests for parsing, slugifying, aggregating, and sorting
- `tests/app/home-page.test.tsx` - home page rendering test
- `tests/app/blog-post-page.test.tsx` - post page rendering test
- `tests/app/series-pages.test.tsx` - series index and detail page rendering tests
- `tests/app/tag-pages.test.tsx` - tag index and detail page rendering tests

## Task 1: Add the test harness

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Write the failing config smoke test**

Create `tests/lib/posts.test.ts` with the smallest import-based assertion so Vitest has a target file:

```ts
import { describe, expect, it } from 'vitest'

describe('test harness', () => {
  it('loads the posts module', async () => {
    const mod = await import('@/lib/posts')
    expect(mod).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/lib/posts.test.ts`

Expected: command fails because `vitest` is not installed or configured.

- [ ] **Step 3: Write the minimal test setup**

Update `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.2.2",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.4.1",
    "jsdom": "^25.0.1",
    "tailwindcss": "^4.2.2",
    "typescript": "^5.0.0",
    "vitest": "^2.1.8"
  }
}
```

Update `tsconfig.json` by extending `compilerOptions.types`:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ]
}
```

Create `vitest.config.ts`:

```ts
import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Install dependencies**

Run: `pnpm install`

Expected: lockfile updated with Vitest and Testing Library packages.

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/lib/posts.test.ts`

Expected: `1 passed`

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json vitest.config.ts vitest.setup.ts tests/lib/posts.test.ts
git commit -m "test: add vitest setup"
```

## Task 2: Add failing tests for taxonomy parsing and aggregation

**Files:**
- Modify: `tests/lib/posts.test.ts`
- Modify: `content/posts/hello-world.mdx`

- [ ] **Step 1: Write failing tests for post normalization**

Replace `tests/lib/posts.test.ts` with:

```ts
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
```

- [ ] **Step 2: Add real frontmatter data for the sample post**

Update `content/posts/hello-world.mdx` frontmatter:

```mdx
---
title: "Hello, World!"
date: "April 4, 2026"
excerpt: "Welcome to my new blog built with Next.js SSG and MDX."
series:
  name: "Blog Basics"
  order: 1
tags:
  - "Next.js"
  - "MDX"
---
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/lib/posts.test.ts`

Expected: failures for missing taxonomy fields and missing exports from `lib/posts.ts`.

- [ ] **Step 4: Commit the red state**

```bash
git add tests/lib/posts.test.ts content/posts/hello-world.mdx
git commit -m "test: define post taxonomy behavior"
```

## Task 3: Implement taxonomy parsing in `lib/posts.ts`

**Files:**
- Modify: `lib/posts.ts`
- Test: `tests/lib/posts.test.ts`

- [ ] **Step 1: Write the minimal implementation**

Update `lib/posts.ts` to:

```ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface PostSeries {
  name: string
  slug: string
  order: number
}

export interface PostTag {
  name: string
  slug: string
}

export interface TaxonomySummary {
  name: string
  slug: string
  count: number
}

export interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  series?: PostSeries
  tags: PostTag[]
}

interface PostFrontmatter {
  title?: string
  date?: string
  excerpt?: string
  series?: {
    name?: string
    order?: number
  }
  tags?: string[]
}

export function slugifyTaxonomy(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeSeries(series: PostFrontmatter['series']): PostSeries | undefined {
  if (!series?.name || typeof series.order !== 'number') {
    return undefined
  }

  return {
    name: series.name,
    slug: slugifyTaxonomy(series.name),
    order: series.order,
  }
}

function normalizeTags(tags: PostFrontmatter['tags']): PostTag[] {
  if (!Array.isArray(tags)) {
    return []
  }

  return tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({
      name,
      slug: slugifyTaxonomy(name),
    }))
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return []
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.mdx'))
}

export function getPostBySlug(slug: string): Post {
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const frontmatter = data as PostFrontmatter

  return {
    slug: realSlug,
    title: frontmatter.title ?? '',
    date: frontmatter.date ?? '',
    excerpt: frontmatter.excerpt ?? '',
    content,
    series: normalizeSeries(frontmatter.series),
    tags: normalizeTags(frontmatter.tags),
  }
}

export function getAllPosts(): Post[] {
  return getPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

function groupCounts(items: Array<{ name: string; slug: string }>): TaxonomySummary[] {
  const map = new Map<string, TaxonomySummary>()

  for (const item of items) {
    const existing = map.get(item.slug)
    if (existing) {
      existing.count += 1
    } else {
      map.set(item.slug, { ...item, count: 1 })
    }
  }

  return Array.from(map.values())
}

export function getAllSeries(): TaxonomySummary[] {
  return groupCounts(
    getAllPosts()
      .map((post) => post.series)
      .filter((series): series is PostSeries => Boolean(series))
  ).sort((a, b) => a.name.localeCompare(b.name))
}

export function getSeriesBySlug(seriesSlug: string): TaxonomySummary | undefined {
  return getAllSeries().find((series) => series.slug === seriesSlug)
}

export function getPostsBySeriesSlug(seriesSlug: string): Post[] {
  return getAllPosts()
    .filter((post) => post.series?.slug === seriesSlug)
    .sort((a, b) => {
      const orderDiff = (a.series?.order ?? 0) - (b.series?.order ?? 0)
      if (orderDiff !== 0) return orderDiff
      const dateDiff = a.date.localeCompare(b.date)
      if (dateDiff !== 0) return dateDiff
      return a.slug.localeCompare(b.slug)
    })
}

export function getAllTags(): TaxonomySummary[] {
  return groupCounts(getAllPosts().flatMap((post) => post.tags)).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.name.localeCompare(b.name)
  })
}

export function getTagBySlug(tagSlug: string): TaxonomySummary | undefined {
  return getAllTags().find((tag) => tag.slug === tagSlug)
}

export function getPostsByTagSlug(tagSlug: string): Post[] {
  return getAllPosts().filter((post) => post.tags.some((tag) => tag.slug === tagSlug))
}
```

- [ ] **Step 2: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/lib/posts.test.ts`

Expected: all tests in `tests/lib/posts.test.ts` pass.

- [ ] **Step 3: Refactor only if needed**

If duplication appears while implementing route support, extract private helpers inside `lib/posts.ts`, but do not change public function names used by the tests.

- [ ] **Step 4: Commit**

```bash
git add lib/posts.ts tests/lib/posts.test.ts content/posts/hello-world.mdx
git commit -m "feat: add post taxonomy data helpers"
```

## Task 4: Add failing tests for the shared taxonomy UI and home page

**Files:**
- Create: `tests/app/home-page.test.tsx`
- Create: `components/post-taxonomy.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the failing home page test**

Create `tests/app/home-page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from '@/app/page'

describe('Home page', () => {
  it('shows series and tags for each post', () => {
    render(<Home />)

    expect(screen.getByRole('link', { name: /blog basics/i })).toHaveAttribute(
      'href',
      '/series/blog-basics'
    )
    expect(screen.getByText(/part 1/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Next.js' })).toHaveAttribute('href', '/tags/next-js')
    expect(screen.getByRole('link', { name: 'MDX' })).toHaveAttribute('href', '/tags/mdx')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/app/home-page.test.tsx`

Expected: assertions fail because the page does not render taxonomy links yet.

- [ ] **Step 3: Write the shared taxonomy component and minimal page integration**

Create `components/post-taxonomy.tsx`:

```tsx
import Link from 'next/link'
import type { Post } from '@/lib/posts'

interface PostTaxonomyProps {
  post: Pick<Post, 'series' | 'tags'>
}

export function PostTaxonomy({ post }: PostTaxonomyProps) {
  if (!post.series && post.tags.length === 0) {
    return null
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-500">
      {post.series ? (
        <Link href={`/series/${post.series.slug}`} className="hover:text-neutral-900">
          Series: {post.series.name} · Part {post.series.order}
        </Link>
      ) : null}
      {post.tags.map((tag) => (
        <Link
          key={tag.slug}
          href={`/tags/${tag.slug}`}
          className="rounded-full border border-neutral-300 px-2 py-1 hover:border-neutral-500 hover:text-neutral-900"
        >
          {tag.name}
        </Link>
      ))}
    </div>
  )
}
```

Update `app/page.tsx` inside each post card:

```tsx
import { PostTaxonomy } from '@/components/post-taxonomy'
```

and render:

```tsx
<p className="text-neutral-700">{post.excerpt}</p>
<PostTaxonomy post={post} />
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/app/home-page.test.tsx`

Expected: `1 passed`

- [ ] **Step 5: Commit**

```bash
git add components/post-taxonomy.tsx app/page.tsx tests/app/home-page.test.tsx
git commit -m "feat: show post taxonomy on home page"
```

## Task 5: Add failing tests for the post page taxonomy UI

**Files:**
- Create: `tests/app/blog-post-page.test.tsx`
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `content/posts/hello-world.mdx`

- [ ] **Step 1: Write the failing post page test**

Create `tests/app/blog-post-page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BlogPost from '@/app/blog/[slug]/page'

describe('Blog post page', () => {
  it('shows taxonomy metadata in the header', async () => {
    const ui = await BlogPost({
      params: Promise.resolve({ slug: 'hello-world' }),
    })

    render(ui)

    expect(screen.getByRole('link', { name: /blog basics/i })).toHaveAttribute(
      'href',
      '/series/blog-basics'
    )
    expect(screen.getByRole('link', { name: 'Next.js' })).toHaveAttribute('href', '/tags/next-js')
  })

  it('shows the current series navigation', async () => {
    const ui = await BlogPost({
      params: Promise.resolve({ slug: 'hello-world' }),
    })

    render(ui)

    expect(screen.getByText(/this series/i)).toBeInTheDocument()
    expect(screen.getByText(/part 1/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /hello, world!/i })).toHaveAttribute(
      'href',
      '/blog/hello-world'
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/app/blog-post-page.test.tsx`

Expected: assertions fail because the post page does not render taxonomy metadata or the series section.

- [ ] **Step 3: Write the minimal implementation**

Update `app/blog/[slug]/page.tsx`:

```tsx
import { PostTaxonomy } from '@/components/post-taxonomy'
```

Extend the data import:

```tsx
import { getAllPosts, getPostBySlug, getPostsBySeriesSlug } from '@/lib/posts'
```

Render taxonomy in the header:

```tsx
<header className="mb-10">
  <h1 className="text-3xl font-bold mb-2 leading-relaxed">{post.title}</h1>
  <p className="text-neutral-500 text-sm">{post.date}</p>
  <PostTaxonomy post={post} />
</header>
```

Render the series section before the MDX body:

```tsx
const seriesPosts = post.series ? getPostsBySeriesSlug(post.series.slug) : []
```

```tsx
{post.series ? (
  <section className="mb-10 rounded-xl border border-neutral-200 p-5">
    <h2 className="mb-4 text-lg font-semibold">This series</h2>
    <ul className="space-y-3">
      {seriesPosts.map((seriesPost) => {
        const isCurrent = seriesPost.slug === post.slug

        return (
          <li key={seriesPost.slug}>
            <Link
              href={`/blog/${seriesPost.slug}`}
              className={isCurrent ? 'font-semibold text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'}
            >
              Part {seriesPost.series?.order} · {seriesPost.title}
            </Link>
          </li>
        )
      })}
    </ul>
  </section>
) : null}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/app/blog-post-page.test.tsx`

Expected: both tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/blog/[slug]/page.tsx tests/app/blog-post-page.test.tsx components/post-taxonomy.tsx
git commit -m "feat: show post taxonomy on blog pages"
```

## Task 6: Add failing tests for `/series` and `/series/[series]`

**Files:**
- Create: `tests/app/series-pages.test.tsx`
- Create: `app/series/page.tsx`
- Create: `app/series/[series]/page.tsx`

- [ ] **Step 1: Write the failing series page tests**

Create `tests/app/series-pages.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SeriesIndexPage from '@/app/series/page'
import SeriesDetailPage, { generateStaticParams } from '@/app/series/[series]/page'

describe('Series pages', () => {
  it('renders the series index', () => {
    render(<SeriesIndexPage />)

    expect(screen.getByRole('heading', { name: /series/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /blog basics/i })).toHaveAttribute(
      'href',
      '/series/blog-basics'
    )
    expect(screen.getByText(/1 post/i)).toBeInTheDocument()
  })

  it('renders a series detail page', async () => {
    const ui = await SeriesDetailPage({
      params: Promise.resolve({ series: 'blog-basics' }),
    })

    render(ui)

    expect(screen.getByRole('heading', { name: 'Blog Basics' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /hello, world!/i })).toHaveAttribute(
      'href',
      '/blog/hello-world'
    )
    expect(screen.getByText(/part 1/i)).toBeInTheDocument()
  })

  it('generates static params from all series', async () => {
    await expect(generateStaticParams()).resolves.toEqual([{ series: 'blog-basics' }])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/app/series-pages.test.tsx`

Expected: module resolution fails because the route files do not exist.

- [ ] **Step 3: Write the minimal implementation**

Create `app/series/page.tsx`:

```tsx
import Link from 'next/link'
import { getAllSeries } from '@/lib/posts'

export default function SeriesIndexPage() {
  const seriesList = getAllSeries()

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Series</h1>
      </header>
      <ul className="space-y-4">
        {seriesList.map((series) => (
          <li key={series.slug} className="border-b border-neutral-200 pb-4">
            <Link href={`/series/${series.slug}`} className="text-lg font-semibold hover:underline">
              {series.name}
            </Link>
            <p className="text-sm text-neutral-500">
              {series.count} {series.count === 1 ? 'post' : 'posts'}
            </p>
          </li>
        ))}
      </ul>
    </main>
  )
}
```

Create `app/series/[series]/page.tsx`:

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllSeries, getPostsBySeriesSlug, getSeriesBySlug } from '@/lib/posts'

interface Props {
  params: Promise<{ series: string }>
}

export async function generateStaticParams() {
  return getAllSeries().map((series) => ({ series: series.slug }))
}

export default async function SeriesDetailPage({ params }: Props) {
  const { series: seriesSlug } = await params
  const series = getSeriesBySlug(seriesSlug)

  if (!series) {
    notFound()
  }

  const posts = getPostsBySeriesSlug(series.slug)

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <header className="mb-10">
        <Link href="/series" className="mb-6 inline-block text-sm text-neutral-600 hover:underline">
          ← Back to series
        </Link>
        <h1 className="text-3xl font-bold">{series.name}</h1>
        <p className="text-sm text-neutral-500">
          {series.count} {series.count === 1 ? 'post' : 'posts'}
        </p>
      </header>
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.slug} className="border-b border-neutral-200 pb-6">
            <p className="mb-1 text-sm text-neutral-500">Part {post.series?.order}</p>
            <Link href={`/blog/${post.slug}`} className="text-xl font-semibold hover:underline">
              {post.title}
            </Link>
            <p className="mt-2 text-sm text-neutral-500">{post.date}</p>
            <p className="mt-2 text-neutral-700">{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/app/series-pages.test.tsx`

Expected: all series route tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/series/page.tsx app/series/[series]/page.tsx tests/app/series-pages.test.tsx
git commit -m "feat: add series pages"
```

## Task 7: Add failing tests for `/tags` and `/tags/[tag]`

**Files:**
- Create: `tests/app/tag-pages.test.tsx`
- Create: `app/tags/page.tsx`
- Create: `app/tags/[tag]/page.tsx`

- [ ] **Step 1: Write the failing tag page tests**

Create `tests/app/tag-pages.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TagsIndexPage from '@/app/tags/page'
import TagDetailPage, { generateStaticParams } from '@/app/tags/[tag]/page'

describe('Tag pages', () => {
  it('renders the tags index', () => {
    render(<TagsIndexPage />)

    expect(screen.getByRole('heading', { name: /tags/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Next.js' })).toHaveAttribute('href', '/tags/next-js')
    expect(screen.getByRole('link', { name: 'MDX' })).toHaveAttribute('href', '/tags/mdx')
  })

  it('renders a tag detail page', async () => {
    const ui = await TagDetailPage({
      params: Promise.resolve({ tag: 'next-js' }),
    })

    render(ui)

    expect(screen.getByRole('heading', { name: 'Next.js' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /hello, world!/i })).toHaveAttribute(
      'href',
      '/blog/hello-world'
    )
    expect(screen.getByRole('link', { name: /blog basics/i })).toHaveAttribute(
      'href',
      '/series/blog-basics'
    )
  })

  it('generates static params from all tags', async () => {
    await expect(generateStaticParams()).resolves.toEqual([
      { tag: 'mdx' },
      { tag: 'next-js' },
    ])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/app/tag-pages.test.tsx`

Expected: module resolution fails because the tag route files do not exist.

- [ ] **Step 3: Write the minimal implementation**

Create `app/tags/page.tsx`:

```tsx
import Link from 'next/link'
import { getAllTags } from '@/lib/posts'

export default function TagsIndexPage() {
  const tags = getAllTags()

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Tags</h1>
      </header>
      <ul className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <li key={tag.slug}>
            <Link
              href={`/tags/${tag.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-2 hover:border-neutral-500"
            >
              <span>{tag.name}</span>
              <span className="text-sm text-neutral-500">{tag.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
```

Create `app/tags/[tag]/page.tsx`:

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllTags, getPostsByTagSlug, getTagBySlug } from '@/lib/posts'
import { PostTaxonomy } from '@/components/post-taxonomy'

interface Props {
  params: Promise<{ tag: string }>
}

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tag.slug }))
}

export default async function TagDetailPage({ params }: Props) {
  const { tag: tagSlug } = await params
  const tag = getTagBySlug(tagSlug)

  if (!tag) {
    notFound()
  }

  const posts = getPostsByTagSlug(tag.slug)

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <header className="mb-10">
        <Link href="/tags" className="mb-6 inline-block text-sm text-neutral-600 hover:underline">
          ← Back to tags
        </Link>
        <h1 className="text-3xl font-bold">{tag.name}</h1>
        <p className="text-sm text-neutral-500">
          {tag.count} {tag.count === 1 ? 'post' : 'posts'}
        </p>
      </header>
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.slug} className="border-b border-neutral-200 pb-6">
            <Link href={`/blog/${post.slug}`} className="text-xl font-semibold hover:underline">
              {post.title}
            </Link>
            <p className="mt-2 text-sm text-neutral-500">{post.date}</p>
            <p className="mt-2 text-neutral-700">{post.excerpt}</p>
            <PostTaxonomy post={post} />
          </li>
        ))}
      </ul>
    </main>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/app/tag-pages.test.tsx`

Expected: all tag route tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/tags/page.tsx app/tags/[tag]/page.tsx tests/app/tag-pages.test.tsx
git commit -m "feat: add tag pages"
```

## Task 8: Verify the full feature end-to-end

**Files:**
- Verify only

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`

Expected: all Vitest suites pass with zero failures.

- [ ] **Step 2: Run the production build**

Run: `pnpm build`

Expected: Next.js build succeeds, static params compile, and no route generation errors occur.

- [ ] **Step 3: Review the final diff**

Run: `git diff --stat HEAD~4..HEAD`

Expected: only the planned taxonomy, route, and test files changed.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add post series and tags pages"
```

## Self-Review

### Spec coverage

- Post metadata parsing and slug generation: covered by Tasks 2 and 3
- Shared taxonomy rendering on home and post pages: covered by Tasks 4 and 5
- `/series` and `/series/[series]`: covered by Task 6
- `/tags` and `/tags/[tag]`: covered by Task 7
- Static generation and 404 behavior: route tasks define `generateStaticParams()` and `notFound()` handling
- Verification: covered by Task 8

### Placeholder scan

No `TBD`, `TODO`, “implement later”, or “similar to Task N” placeholders remain in the plan.

### Type consistency

- Shared types use `Post`, `PostSeries`, `PostTag`, and `TaxonomySummary`
- Public taxonomy helpers remain consistent between tests and implementation
- Route params use `series` and `tag`, matching the target file system routes
