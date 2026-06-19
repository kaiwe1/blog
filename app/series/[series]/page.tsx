import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllSeries, getPostsBySeriesSlug, getSeriesBySlug } from '@/lib/posts'

interface Props {
  params: Promise<{ series: string }>
}

export function generateStaticParams() {
  return getAllSeries().map((series) => ({ series: series.slug }))
}

export default async function SeriesPage({ params }: Props) {
  const { series: seriesSlug } = await params
  const series = getSeriesBySlug(seriesSlug)

  if (!series) {
    notFound()
  }

  const posts = getPostsBySeriesSlug(seriesSlug)

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/series" className="text-sm text-text-secondary underline underline-offset-4">
        Back to series
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-bold text-text">{series.name}</h1>
        <p className="mt-2 text-text-secondary">
          {series.count} {series.count === 1 ? 'post' : 'posts'}
        </p>
      </header>

      <ul className="mt-8 space-y-5">
        {posts.map((post) => (
          <li key={post.slug} className="border-b border-border pb-5 last:border-b-0">
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <span>Part {post.series?.order}</span>
              <span>{post.date}</span>
            </div>
            <Link href={`/blog/${post.slug}`} className="mt-2 block text-xl font-semibold text-text no-underline">
              {post.title}
            </Link>
            <p className="mt-2 text-text-secondary">{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
