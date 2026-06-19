import { getAllPosts, getAllTags, getAllSeries } from '@/lib/posts'
import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

// 站点地图主要用来告诉搜索引擎（如 Google、Bing）你的网站有哪些页面，方便它们更高效地爬取和索引。
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  const tags = getAllTags()
  const series = getAllSeries()
  const baseUrl = 'https://kaiweizhang.com'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/series`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...tags.map((tag) => ({
      url: `${baseUrl}/tags/${tag.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...series.map((s) => ({
      url: `${baseUrl}/series/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
