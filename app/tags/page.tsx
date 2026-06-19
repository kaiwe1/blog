import Link from 'next/link'
import { getAllTags } from '@/lib/posts'

export default function TagsIndexPage() {
  const tags = getAllTags()

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <header>
        <h1 className="text-3xl font-bold text-text">Tags</h1>
        <p className="mt-3 text-text-secondary">Browse posts grouped by tag.</p>
      </header>

      <ul className="mt-8 space-y-4">
        {tags.map((tag) => (
          <li key={tag.slug} className="rounded-lg border border-border p-4">
            <Link href={`/tags/${tag.slug}`} className="text-lg font-semibold text-text underline underline-offset-4">
              {tag.name}
            </Link>
            <p className="mt-2 text-sm text-text-secondary">
              {tag.count} {tag.count === 1 ? 'post' : 'posts'}
            </p>
          </li>
        ))}
      </ul>
    </main>
  )
}
