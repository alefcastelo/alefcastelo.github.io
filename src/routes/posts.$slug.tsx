import { createFileRoute, notFound } from '@tanstack/react-router'
import { findPost, formatDate } from '#/posts'

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
    <article>
      <time dateTime={post.date} className="text-sm text-muted">
        {formatDate(post.date)}
      </time>
      <h1 className="mt-2 text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
        {post.title}
      </h1>
      <div className="prose mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  )
}
