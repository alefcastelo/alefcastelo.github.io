import { useRouter } from '@tanstack/react-router'
import { CommentForm } from '#/comments/CommentForm'
import { CommentItem } from '#/comments/CommentItem'
import { createComment } from '#/server/comments'
import type { CommentView } from '#/server/comment-store'
import type { Viewer } from '#/server/viewer'

/** Better Auth's codes for a provider that did not verify the email: a new account, or a link to an existing one. */
const UNVERIFIED_EMAIL = ['unable_to_create_user', 'account_not_linked']

export function CommentsSection({
  slug,
  comments,
  maxLength,
  viewer,
  signInError,
}: {
  slug: string
  comments: Array<CommentView>
  maxLength: number
  viewer: Viewer | null
  /** The `?error=` Better Auth adds when a sign-in started here fails. */
  signInError?: string
}) {
  const router = useRouter()
  const topLevel = comments.filter((comment) => comment.parentId === null)

  async function comment(body: string) {
    const result = await createComment({ data: { slug, body } })
    if (result !== 'created') return result
    await router.invalidate()
    return 'ok'
  }

  return (
    <section id="comments" aria-labelledby="comments-heading" className="border-t border-muted/25 pt-8">
      <h2 id="comments-heading" className="font-semibold tracking-tight">
        Comments
      </h2>
      {topLevel.length > 0 && (
        <ol className="mt-6 flex flex-col gap-6">
          {topLevel.map((top) => {
            const replies = comments.filter((reply) => reply.parentId === top.id)
            return (
              <CommentItem key={top.id} comment={top} slug={slug} maxLength={maxLength} canReply={viewer !== null}>
                {replies.length > 0 && (
                  <ol className="mt-4 flex flex-col gap-4">
                    {replies.map((reply) => (
                      <CommentItem key={reply.id} comment={reply} slug={slug} maxLength={maxLength} canReply={false} />
                    ))}
                  </ol>
                )}
              </CommentItem>
            )
          })}
        </ol>
      )}
      <div className="mt-6">
        {viewer ? (
          <CommentForm label="Comment" submitLabel="Comment" maxLength={maxLength} onSubmit={comment} />
        ) : (
          <SignIn slug={slug} error={signInError} />
        )}
      </div>
    </section>
  )
}

function SignIn({ slug, error }: { slug: string; error?: string }) {
  async function signIn(provider: 'github' | 'google') {
    const post = `/posts/${slug}`
    const { authClient } = await import('#/auth-client')
    return authClient.signIn.social({ provider, callbackURL: post, errorCallbackURL: post })
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
          {UNVERIFIED_EMAIL.includes(error)
            ? 'Your account email must be verified with the provider'
            : 'Sign-in failed, try again'}
        </p>
      )}
      <p className="text-muted">Sign in to comment.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => signIn('github')}
          className="rounded-sm border border-muted/40 px-4 py-1.5 font-medium"
        >
          Sign in with GitHub
        </button>
        <button
          type="button"
          onClick={() => signIn('google')}
          className="rounded-sm border border-muted/40 px-4 py-1.5 font-medium"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
