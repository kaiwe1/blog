import Link from 'next/link'
import { getAllTags } from '@/lib/posts'

export default function TagsIndexPage() {
  const tags = getAllTags()

  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-neutral-900">Tags</h1>
      <p className="mt-3 text-neutral-600">Browse posts grouped by tag.</p>

      <ul className="mt-8 space-y-4">
        {tags.map((tag) => (
          <li key={tag.slug} className="rounded-lg border border-neutral-200 p-4">
            <Link href={`/tags/${tag.slug}`} className="text-lg font-semibold text-neutral-900 underline underline-offset-4">
              {tag.name}
            </Link>
            <p className="mt-2 text-sm text-neutral-600">
              {tag.count} {tag.count === 1 ? 'post' : 'posts'}
            </p>
          </li>
        ))}
      </ul>
    </main>
  )
}
