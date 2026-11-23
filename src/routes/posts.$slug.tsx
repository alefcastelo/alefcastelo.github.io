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
    <article className="max-w-[680px]">
      <h1 className="font-pixel text-[clamp(44px,7vw,72px)] leading-[0.92] text-balance text-ivory">
        {post.title}
      </h1>
      <time dateTime={post.date} className="mt-5 block font-pixel text-xl leading-none text-muted">
        {formatDate(new Date(post.date))}
      </time>
      <div className="prose mt-12" dangerouslySetInnerHTML={{ __html: post.html }} />
      <div className="mt-16">
        <ReactionBar slug={post.slug} reactions={reactions} signedIn={viewer !== null} />
      </div>
      <div className="mt-20">
        <CommentsSection
          slug={post.slug}
          comments={comments}
          maxLength={commentMaxLength}
          viewer={viewer}
          signInError={error}
        />
      </div>
      <div className="mt-20">
        <SubscribeForm />
      </div>
    </article>
  )
}
