import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
}

// Compare these two URLs pointing to the same article:
// Using a Numeric ID: https://yourblog.com/posts/92831
// Using a Slug: https://yourblog.com/posts/typescript-configuration-guide

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return []
  // return only .mdx file names without dir
  return fs.readdirSync(postsDirectory).filter((f) => f.endsWith('.mdx')) 
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs()
  return slugs
    .map((slug) => getPostBySlug(slug))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPostBySlug(slug: string): Post {
  // Remove .mdx extension from slug to get the real slug
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`)

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  
  const { data, content } = matter(fileContents) // TODO: type definition
  return {
    slug: realSlug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt,
    content,
  }
}
