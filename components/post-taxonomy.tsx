import Link from 'next/link'
import type { Post } from '@/lib/posts'

interface PostTaxonomyProps {
  series?: Post['series']
  tags: Post['tags']
}

export function PostTaxonomy({ series, tags }: PostTaxonomyProps) {
  if (!series && tags.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-600">
      {series ? (
        <div className="flex items-center gap-2">
          <span className="font-medium">Series:</span>
          <Link href={`/series/${series.slug}`} className="border border-neutral-300 px-2 py-0.5 text-xs font-medium text-neutral-700 no-underline transition-colors hover:border-neutral-500">
            {series.name}
          </Link>
        </div>
      ) : null}

      {tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">Tags:</span>
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              className="border border-neutral-300 px-2 py-0.5 text-xs font-medium text-neutral-700 no-underline transition-colors hover:border-neutral-500"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
