import { and, eq, isNotNull, isNull, notExists } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import type { Auth } from '#/server/auth'
import type { Db } from '#/server/db/client'
import { comments, user } from '#/server/db/schema'

export type DeleteAccountResult = 'deleted' | 'unauthenticated'

const replies = alias(comments, 'replies')

/**
 * Deletes the signed-in reader's account, then clears the Better Auth cookies.
 * `signOut` accepts the session the transaction already deleted.
 */
export async function deleteViewerAccount(db: Db, auth: Auth, headers: Headers): Promise<DeleteAccountResult> {
  const session = await auth.api.getSession({ headers })
  if (!session) return 'unauthenticated'
  deleteUserAccount(db, session.user.id)
  await auth.api.signOut({ headers })
  return 'deleted'
}

/**
 * One synchronous transaction, in this order so no "[deleted]" is left without replies.
 * Sessions, provider links and everything else that references the user go in the cascade.
 */
export function deleteUserAccount(db: Db, userId: string): void {
  db.transaction((tx) => {
    const hasNoReplies = notExists(
      tx.select().from(replies).where(eq(replies.parentId, comments.id)),
    )
    // 1. Their replies.
    tx.delete(comments)
      .where(and(eq(comments.userId, userId), isNotNull(comments.parentId)))
      .run()
    // 2. Their top-level comments left without replies.
    tx.delete(comments)
      .where(and(eq(comments.userId, userId), isNull(comments.parentId), hasNoReplies))
      .run()
    // 3. Their comments that still have replies become "[deleted]", without author.
    tx.update(comments).set({ body: null, userId: null }).where(eq(comments.userId, userId)).run()
    // 4. Any "[deleted]" whose last reply was theirs.
    tx.delete(comments)
      .where(and(isNull(comments.parentId), isNull(comments.body), hasNoReplies))
      .run()
    // 5. The user; sessions, accounts and reactions follow by ON DELETE CASCADE.
    tx.delete(user).where(eq(user.id, userId)).run()
  })
}
