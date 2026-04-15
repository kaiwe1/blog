import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/posts')

interface RawSeries {
  name?: unknown
  order?: unknown
}

interface RawPostData {
  title?: unknown
  date?: unknown
  excerpt?: unknown
  series?: RawSeries | null
  tags?: unknown
}

export interface PostSeries {
  name: string
  slug: string
  order: number
}

export interface PostTag {
  name: string
  slug: string
}

export interface TaxonomyEntry {
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

export function slugifyTaxonomy(value: string): string {
  return value
    .toLowerCase()                    // 1. Convert to lowercase
    .trim()                           // 2. Remove leading/trailing whitespace
    .replace(/[^a-z0-9]+/g, '-')      // 3. Replace non-alphanumeric chars with dashes
    .replace(/-+/g, '-')              // 4. Collapse multiple dashes into one
    .replace(/^-|-$/g, '')            // 5. Remove leading/trailing dashes
}

function normalizeSeries(series: RawSeries | null | undefined): PostSeries | undefined {
  if (!series || typeof series !== 'object') return undefined
  if (typeof series.name !== 'string') return undefined

  const name = series.name.trim()
  const order = Number(series.order)

  if (!name || Number.isNaN(order)) return undefined

  return {
    name,
    slug: slugifyTaxonomy(name),
    order,
  }
}

function normalizeTags(tags: unknown): PostTag[] {
  if (!Array.isArray(tags)) return []

  return tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((name) => ({
      name,
      slug: slugifyTaxonomy(name),
    }))
}

function normalizePost(realSlug: string, rawData: RawPostData, content: string): Post {
  return {
    slug: realSlug,
    title: typeof rawData.title === 'string' ? rawData.title : '',
    date: typeof rawData.date === 'string' ? rawData.date : '',
    excerpt: typeof rawData.excerpt === 'string' ? rawData.excerpt : '',
    content,
    series: normalizeSeries(rawData.series),
    tags: normalizeTags(rawData.tags),
  }
}

function comparePostsByDateDesc(a: Post, b: Post): number {
  return a.date < b.date ? 1 : -1
}

function compareSeriesPosts(a: Post, b: Post): number {
  const aOrder = a.series?.order ?? Number.MAX_SAFE_INTEGER
  const bOrder = b.series?.order ?? Number.MAX_SAFE_INTEGER

  if (aOrder !== bOrder) return aOrder - bOrder
  if (a.date !== b.date) return a.date < b.date ? -1 : 1

  return a.slug.localeCompare(b.slug)
}

function buildTaxonomyEntries(items: PostTag[] | PostSeries[]): TaxonomyEntry[] {
  const counts = new Map<string, TaxonomyEntry>()

  for (const item of items) {
    const existing = counts.get(item.slug)
    if (existing) {
      existing.count += 1
      continue
    }

    counts.set(item.slug, {
      name: item.name,
      slug: item.slug,
      count: 1,
    })
  }

  return Array.from(counts.values())
}

// Compare these two URLs pointing to the same article:
// Using a Numeric ID: https://yourblog.com/posts/92831
// Using a Slug: https://yourblog.com/posts/typescript-configuration-guide

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return []
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.mdx'))
}

export function getAllPosts(): Post[] {
  return getPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .sort(comparePostsByDateDesc)
}

export function getPostBySlug(slug: string): Post {
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return normalizePost(realSlug, data as RawPostData, content)
}

export function getAllSeries(): TaxonomyEntry[] {
  return buildTaxonomyEntries(
    getAllPosts()
      .map((post) => post.series)
      .filter((series): series is PostSeries => Boolean(series))
  ).sort((a, b) => a.name.localeCompare(b.name))
}

export function getSeriesBySlug(seriesSlug: string): TaxonomyEntry | undefined {
  return getAllSeries().find((series) => series.slug === seriesSlug)
}

export function getPostsBySeriesSlug(seriesSlug: string): Post[] {
  return getAllPosts()
    .filter((post) => post.series?.slug === seriesSlug)
    .sort(compareSeriesPosts)
}

export function getAllTags(): TaxonomyEntry[] {
  return buildTaxonomyEntries(getAllPosts().flatMap((post) => post.tags)).sort((a, b) => {
    if (a.count !== b.count) return b.count - a.count
    return a.name.localeCompare(b.name)
  })
}

export function getTagBySlug(tagSlug: string): TaxonomyEntry | undefined {
  return getAllTags().find((tag) => tag.slug === tagSlug)
}

export function getPostsByTagSlug(tagSlug: string): Post[] {
  return getAllPosts().filter((post) => post.tags.some((tag) => tag.slug === tagSlug))
}
