import { useState, type ReactNode } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Avatar } from '#/Avatar'
import { CommentForm } from '#/comments/CommentForm'
import { formatDate } from '#/format-date'
import { createComment, deleteComment, editComment } from '#/server/comments'
import type { CommentView } from '#/server/comment-store'

export function CommentItem({
  comment,
  slug,
  maxLength,
  canReply,
  children,
}: {
  comment: CommentView
  slug: string
  maxLength: number
  /** Only top-level comments of a signed-in reader offer "Reply". */
  canReply: boolean
  children?: ReactNode
}) {
  const router = useRouter()
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleteFailed, setDeleteFailed] = useState(false)

  async function reply(body: string) {
    const result = await createComment({ data: { slug, body, parentId: comment.id } })
    if (result !== 'created') return result
    setReplying(false)
    await router.invalidate()
    return 'ok'
  }

  async function edit(body: string) {
    const result = await editComment({ data: { id: comment.id, body } })
    if (result !== 'edited') return result
    setEditing(false)
    await router.invalidate()
    return 'ok'
  }

  async function remove() {
    if (!window.confirm('Delete this comment?')) return
    const result = await deleteComment({ data: comment.id })
    setDeleteFailed(result !== 'deleted')
    await router.invalidate()
  }

  return (
    <li>
      <article
        aria-label={comment.author ? `Comment by ${comment.author.name}` : 'Deleted comment'}
        className="flex gap-3"
      >
        {comment.author ? (
          <Avatar name={comment.author.name} image={comment.author.image} size={32} />
        ) : (
          <span aria-hidden="true" className="size-8 shrink-0 rounded-full bg-muted/15" />
        )}
        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-baseline gap-x-2 text-sm">
            {comment.author && <span className="font-semibold">{comment.author.name}</span>}
            <time dateTime={new Date(comment.createdAt).toISOString()} className="text-muted">
              {formatDate(new Date(comment.createdAt))}
            </time>
            {comment.editedAt !== null && comment.html !== null && <span className="text-muted">(edited)</span>}
          </header>
          {comment.html === null ? (
            <p className="mt-1 text-muted italic">[deleted]</p>
          ) : editing ? (
            <div className="mt-2">
              <CommentForm
                label="Edit comment"
                submitLabel="Save"
                maxLength={maxLength}
                initialBody={comment.markdown ?? ''}
                autoFocus
                onSubmit={edit}
                onCancel={() => setEditing(false)}
              />
            </div>
          ) : (
            <div
              className="prose mt-1 font-sans text-base"
              dangerouslySetInnerHTML={{ __html: comment.html }}
            />
          )}
          {!editing && (
            <div className="mt-1 flex gap-4 text-sm text-muted empty:hidden">
              {canReply && !replying && (
                <button type="button" onClick={() => setReplying(true)} className="underline underline-offset-4">
                  Reply
                </button>
              )}
              {comment.canEdit && (
                <button type="button" onClick={() => setEditing(true)} className="underline underline-offset-4">
                  Edit
                </button>
              )}
              {comment.canDelete && (
                <button type="button" onClick={remove} className="underline underline-offset-4">
                  Delete
                </button>
              )}
            </div>
          )}
          {deleteFailed && (
            <p role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
              Couldn't delete the comment, try again
            </p>
          )}
          {replying && (
            <div className="mt-3">
              <CommentForm
                label="Reply"
                submitLabel="Reply"
                maxLength={maxLength}
                autoFocus
                onSubmit={reply}
                onCancel={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </article>
      {children && <div className="ml-11">{children}</div>}
    </li>
  )
}
