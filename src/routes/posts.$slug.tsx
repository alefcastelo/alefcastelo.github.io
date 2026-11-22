import { createFileRoute, notFound } from '@tanstack/react-router'
import { CommentsSection } from '#/comments/CommentsSection'
import { formatDate } from '#/format-date'
import { SubscribeForm } from '#/newsletter/SubscribeForm'
import { ReactionBar } from '#/reactions/ReactionBar'
import { listComments } from '#/server/comments'
import { fetchPost } from '#/server/posts'
import { listReactions } from '#/server/reactions'

export const Route = createFileRoute('/posts/$slug')({
  validateSearch: (search: Record<string, unknown>): { error?: string } =>
    typeof search.error === 'string' ? { error: search.error } : {},
  loader: async ({ params }) => {
    const [post, { comments, commentMaxLength }, reactions] = await Promise.all([
      fetchPost({ data: params.slug }),
      listComments({ data: params.slug }),
      listReactions({ data: params.slug }),
    ])
    if (post === null) throw notFound()
    return { post, comments, reactions, commentMaxLength }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.post.title} — Alef Castelo` },
          { name: 'description', content: loaderData.post.description },
        ]
      : [],
  }),
  component: PostPage,
})

function PostPage() {
  const { post, comments, reactions, commentMaxLength } = Route.useLoaderData()
  const { viewer } = Route.useRouteContext()
  const { error } = Route.useSearch()
  return (
    <article>
      <time dateTime={post.date} className="text-sm text-muted">
        {formatDate(new Date(post.date))}
      </time>
      <h1 className="mt-2 text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
        {post.title}
      </h1>
      <div className="prose mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />
      <div className="mt-12">
        <ReactionBar slug={post.slug} reactions={reactions} signedIn={viewer !== null} />
      </div>
      <div className="mt-16">
        <CommentsSection
          slug={post.slug}
          comments={comments}
          maxLength={commentMaxLength}
          viewer={viewer}
          signInError={error}
        />
      </div>
      <div className="mt-16">
        <SubscribeForm />
      </div>
    </article>
  )
}
