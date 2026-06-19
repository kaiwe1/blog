import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllTags, getPostsByTagSlug, getTagBySlug } from '@/lib/posts'
import { PostTaxonomy } from '@/components/post-taxonomy'

interface Props {
  params: Promise<{ tag: string }>
}

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tag.slug }))
}

export default async function TagPage({ params }: Props) {
  const { tag: tagSlug } = await params
  const tag = getTagBySlug(tagSlug)

  if (!tag) {
    notFound()
  }

  const posts = getPostsByTagSlug(tagSlug)

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/tags" className="text-sm text-text-secondary underline underline-offset-4">
        Back to tags
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-bold text-text">{tag.name}</h1>
        <p className="mt-2 text-text-secondary">
          {tag.count} {tag.count === 1 ? 'post' : 'posts'}
        </p>
      </header>

      <ul className="mt-8 space-y-5">
        {posts.map((post) => (
          <li key={post.slug} className="border-b border-border pb-5 last:border-b-0">
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <span>{post.date}</span>
            </div>
            <Link href={`/blog/${post.slug}`} className="mt-2 block text-xl font-semibold text-text no-underline">
              {post.title}
            </Link>
            <p className="mt-2 text-text-secondary">{post.excerpt}</p>
            <PostTaxonomy series={post.series} tags={post.tags.filter((entry) => entry.slug !== tagSlug)} />
          </li>
        ))}
      </ul>
    </main>
  )
}
