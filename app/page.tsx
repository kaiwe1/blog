import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

export default function Home() {
  const posts = getAllPosts()

  return (
    <>
      <main className="max-w-xl mx-auto px-6 py-16">
        <header className="mb-12 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">about me</h2>
            <p className="text-neutral-600 text-lg">Frontend Engineer @Meituan, interested in frontend system design.</p>
          </div>
        </header>
        <section>
          {posts.length === 0 ? (
            <p className="text-neutral-400">No posts yet. Check back soon!</p>
          ) : (
            <ul className="space-y-0 list-none">
              {posts.map((post) => (
                <li
                  key={post.slug}
                  className="mb-7 pb-7 border-b border-neutral-200 last:border-0 last:mb-0 last:pb-0 hover:border-neutral-400 hover:border transition-colors duration-200"
                >
                  <Link href={`/blog/${post.slug}`} className="text-inherit no-underline">
                    <div className="flex items-baseline gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-neutral-700">
                        {post.title}
                      </h3>
                      <p className="text-neutral-500 text-sm">{post.date}</p>
                    </div>
                    <p className="text-neutral-700">{post.excerpt}</p>
                  </Link>

                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <footer className="mt-90">
        <section>
          <img
            src="/as11-40-5875~large.jpg"
            alt="Astronaut Edwin Aldrin poses for photograph beside deployed U.S. flag"
            className="w-full rounded-lg"
          />
        </section>
      </footer>
    </>

  )
}
