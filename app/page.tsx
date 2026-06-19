import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { PostTaxonomy } from '@/components/post-taxonomy'

export default function Home() {
  const posts = getAllPosts()

  return (
    <>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <section>
          {/* Post List */}
          {posts.length === 0 ? (
            <p className="text-neutral-400">No posts yet. Check back soon!</p>
          ) : (
            <ul className="space-y-0 list-none">
              {posts.map((post) => (
                <li
                  key={post.slug}
                  className="mb-10 last:mb-0"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    <Link href={`/blog/${post.slug}`} className="text-inherit no-underline">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-neutral-700">{post.excerpt}</p>
                  <PostTaxonomy series={post.series} tags={post.tags} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>

  )
}
