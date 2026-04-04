import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="inline-block mb-8 text-neutral-600 text-sm no-underline hover:underline"
      >
        ← Back to home
      </Link>

      <article>
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-2 leading-relaxed">{post.title}</h1>
          <p className="text-neutral-500 text-sm">{post.date}</p>
        </header>

        <div className="text-base leading-relaxed text-neutral-800 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mt-8 [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mt-6 [&>h2]:mb-3 [&>p]:my-4 [&>ul]:list-disc [&>ul]:pl-6 [&>li]:my-1 [&>blockquote]:border-l-4 [&>blockquote]:border-neutral-600 [&>blockquote]:pl-4 [&>blockquote]:my-4 [&>blockquote]:text-neutral-600 [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_pre]:bg-[#1e1e1e] [&_pre]:text-neutral-300 [&_pre]:rounded-lg [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0">
          <MDXRemote
            source={post.content}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeHighlight, rehypeSlug],
              },
            }}
          />
        </div>
      </article>
    </main>
  )
}