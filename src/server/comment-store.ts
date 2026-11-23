import { and, asc, count, eq, gt, isNull, sql } from 'drizzle-orm'
import { findPost } from '#/posts'
import { renderCommentMarkdown } from '#/server/comment-markdown'
import type { Db } from '#/server/db/client'
import { comments, user } from '#/server/db/schema'
import type { Viewer } from '#/server/viewer'

const MINUTE = 60_000

/** What the browser gets for each comment: never the author's id or email. */
export type CommentView = {
  id: string
  parentId: string | null
  /** null shows as "[deleted]". */
  html: string | null
  /** The raw text, only for its author, who edits it in place. */
  markdown: string | null
  createdAt: number
  editedAt: number | null
  author: { name: string; image: string | null } | null
  canEdit: boolean
  canDelete: boolean
}

export type CommentLimits = { maxLength: number; ratePerMinute: number }

type BodyError = 'empty' | 'too_long'

export type CreateCommentResult =
  | 'created'
  | 'unauthenticated'
  | BodyError
  | 'post_not_found'
  | 'invalid_parent'
  | 'rate_limited'

export type EditCommentResult = 'edited' | 'unauthenticated' | 'not_found' | 'deleted' | 'forbidden' | BodyError

export type DeleteCommentResult = 'deleted' | 'unauthenticated' | 'not_found' | 'forbidden'

/** Top-level comments oldest first, each followed by its replies oldest first. */
export function listPostComments(db: Db, viewer: Viewer | null, slug: string): Array<CommentView> {
  const rows = db
    .select({
      id: comments.id,
      parentId: comments.parentId,
      userId: comments.userId,
      body: comments.body,
      createdAt: comments.createdAt,
      editedAt: comments.editedAt,
      authorName: user.name,
      authorImage: user.image,
    })
    .from(comments)
    .leftJoin(user, eq(comments.userId, user.id))
    .where(eq(comments.postSlug, slug))
    .orderBy(asc(comments.createdAt), asc(sql`${comments}.rowid`))
    .all()

  const views = rows.map((row): CommentView => {
    const deleted = row.body === null
    const isAuthor = viewer !== null && row.userId === viewer.id
    return {
      id: row.id,
      parentId: row.parentId,
      html: deleted ? null : renderCommentMarkdown(row.body!),
      markdown: !deleted && isAuthor ? row.body : null,
      createdAt: row.createdAt.getTime(),
      editedAt: row.editedAt?.getTime() ?? null,
      author:
        deleted || row.authorName === null
          ? null
          : { name: row.authorName, image: row.authorImage },
      canEdit: !deleted && isAuthor,
      canDelete: !deleted && (isAuthor || viewer?.isAdmin === true),
    }
  })
  return views
    .filter((view) => view.parentId === null)
    .flatMap((top) => [top, ...views.filter((view) => view.parentId === top.id)])
}

export function createPostComment(
  db: Db,
  viewer: Viewer | null,
  limits: CommentLimits,
  input: { slug: string; body: string; parentId?: string | null },
  now: Date = new Date(),
): CreateCommentResult {
  if (!viewer) return 'unauthenticated'
  const bodyError = checkBody(input.body, limits.maxLength)
  if (bodyError) return bodyError
  if (!findPost(input.slug)) return 'post_not_found'

  let parentId: string | null = null
  if (input.parentId) {
    const parent = db.select().from(comments).where(eq(comments.id, input.parentId)).get()
    if (!parent || parent.postSlug !== input.slug) return 'invalid_parent'
    // A reply to a reply hangs from the top-level comment: one level only.
    parentId = parent.parentId ?? parent.id
  }

  const [{ recent }] = db
    .select({ recent: count() })
    .from(comments)
    .where(and(eq(comments.userId, viewer.id), gt(comments.createdAt, new Date(now.getTime() - MINUTE))))
    .all()
  if (recent >= limits.ratePerMinute) return 'rate_limited'

  db.insert(comments)
    .values({
      id: crypto.randomUUID(),
      postSlug: input.slug,
      userId: viewer.id,
      parentId,
      body: input.body,
      createdAt: now,
    })
    .run()
  return 'created'
}

/** Only the author edits, with the same text rules as creating; a "[deleted]" stays as it is. */
export function editPostComment(
  db: Db,
  viewer: Viewer | null,
  limits: Pick<CommentLimits, 'maxLength'>,
  input: { id: string; body: string },
  now: Date = new Date(),
): EditCommentResult {
  if (!viewer) return 'unauthenticated'
  const comment = db.select().from(comments).where(eq(comments.id, input.id)).get()
  if (!comment) return 'not_found'
  if (comment.body === null) return 'deleted'
  if (comment.userId !== viewer.id) return 'forbidden'
  const bodyError = checkBody(input.body, limits.maxLength)
  if (bodyError) return bodyError
  db.update(comments).set({ body: input.body, editedAt: now }).where(eq(comments.id, input.id)).run()
  return 'edited'
}

/**
 * The author or an admin deletes. A comment with replies stays as "[deleted]";
 * a "[deleted]" goes away with its last reply.
 */
export function deletePostComment(db: Db, viewer: Viewer | null, id: string): DeleteCommentResult {
  if (!viewer) return 'unauthenticated'
  return db.transaction((tx) => {
    const comment = tx.select().from(comments).where(eq(comments.id, id)).get()
    if (!comment || comment.body === null) return 'not_found'
    if (comment.userId !== viewer.id && !viewer.isAdmin) return 'forbidden'

    const replies = (parentId: string) =>
      tx.select({ total: count() }).from(comments).where(eq(comments.parentId, parentId)).get()!.total

    if (replies(comment.id) > 0) {
      tx.update(comments).set({ body: null }).where(eq(comments.id, comment.id)).run()
      return 'deleted'
    }
    tx.delete(comments).where(eq(comments.id, comment.id)).run()
    if (comment.parentId !== null && replies(comment.parentId) === 0) {
      tx.delete(comments)
        .where(and(eq(comments.id, comment.parentId), isNull(comments.body)))
        .run()
    }
    return 'deleted'
  })
}

/** Length counts code points, the same as the counter in the comment box. */
function checkBody(body: string, maxLength: number): BodyError | null {
  if ([...body].length > maxLength) return 'too_long'
  const text = renderCommentMarkdown(body).replace(/<[^>]*>/g, '')
  // \s misses the invisible format characters (\p{Cf}), such as the zero-width space.
  if (text.replace(/[\s\p{Cf}]/gu, '') === '') return 'empty'
  return null
}
