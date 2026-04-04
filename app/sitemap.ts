import { getAllPosts } from '@/lib/posts'

export default function sitemap() {
  const posts = getAllPosts()
  const baseUrl = 'https://kaiweizhang.com'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug})}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
  ]
}
