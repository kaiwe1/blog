import Link from 'next/link'
import { getAllSeries } from '@/lib/posts'

export default function SeriesIndexPage() {
  const series = getAllSeries()

  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <header>
        <h1 className="text-3xl font-bold text-neutral-900">Series</h1>
        <p className="mt-3 text-neutral-600">Browse posts grouped by series.</p>
      </header>

      <ul className="mt-8 space-y-4">
        {series.map((entry) => (
          <li key={entry.slug} className="rounded-lg border border-neutral-200 p-4">
            <Link href={`/series/${entry.slug}`} className="text-lg font-semibold text-neutral-900 underline underline-offset-4">
              {entry.name}
            </Link>
            <p className="mt-2 text-sm text-neutral-600">
              {entry.count} {entry.count === 1 ? 'post' : 'posts'}
            </p>
          </li>
        ))}
      </ul>
    </main>
  )
}
