import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { AUTHOR_BIO } from '#/author'
import { findPost } from '#/posts'

export const Route = createFileRoute('/posts/$slug')({
  loader: ({ params }) => {
    const post = findPost(params.slug)
    if (post === null) throw notFound()
    return post
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Alef Castelo` },
          { name: 'description', content: loaderData.description },
        ]
      : [],
  }),
  component: PostPage,
})

function PostPage() {
  const post = Route.useLoaderData()
  return (
    <article className="max-w-[680px]">
      <h1 className="font-pixel text-[clamp(44px,7vw,72px)] leading-[0.92] text-balance text-ivory">
        {post.title}
      </h1>
      <time dateTime={post.date} className="mt-5 block font-pixel text-xl leading-none text-muted">
        {post.date}
      </time>
      <div className="prose mt-12" dangerouslySetInnerHTML={{ __html: post.html }} />
      <aside aria-label="About the author" className="mt-16 flex items-start gap-5">
        <img src="/me.jpg" alt="" width={64} height={64} className="size-16 shrink-0 object-cover" />
        <div>
          <Link to="/" className="font-pixel text-[28px] leading-none text-ivory uppercase hover:text-amber">
            Alef Castelo
          </Link>
          <p className="mt-2 leading-relaxed text-muted">{AUTHOR_BIO}</p>
        </div>
      </aside>
    </article>
  )
}
