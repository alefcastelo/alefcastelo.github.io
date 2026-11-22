import { and, count, eq } from 'drizzle-orm'
import { findPost } from '#/posts'
import { isReactionEmoji, REACTION_EMOJIS, type ReactionEmoji } from '#/reactions/emojis'
import type { Db } from '#/server/db/client'
import { reactions } from '#/server/db/schema'
import type { Viewer } from '#/server/viewer'

export type ReactionView = { emoji: ReactionEmoji; count: number; reactedByViewer: boolean }

export type ToggleReactionResult = 'on' | 'off' | 'unauthenticated' | 'invalid_emoji' | 'post_not_found'

/** Every emoji of the set, in its order, with its total count (zero included). */
export function listPostReactions(db: Db, viewer: Viewer | null, slug: string): Array<ReactionView> {
  const counts = db
    .select({ emoji: reactions.emoji, total: count() })
    .from(reactions)
    .where(eq(reactions.postSlug, slug))
    .groupBy(reactions.emoji)
    .all()
  const mine = viewer
    ? db
        .select({ emoji: reactions.emoji })
        .from(reactions)
        .where(and(eq(reactions.postSlug, slug), eq(reactions.userId, viewer.id)))
        .all()
        .map((row) => row.emoji)
    : []
  return REACTION_EMOJIS.map((emoji) => ({
    emoji,
    count: counts.find((row) => row.emoji === emoji)?.total ?? 0,
    reactedByViewer: mine.includes(emoji),
  }))
}

/** Turns the viewer's reaction on or off, by the (post, user, emoji) primary key. */
export function togglePostReaction(
  db: Db,
  viewer: Viewer | null,
  input: { slug: string; emoji: string },
): ToggleReactionResult {
  if (!viewer) return 'unauthenticated'
  if (!isReactionEmoji(input.emoji)) return 'invalid_emoji'
  if (!findPost(input.slug)) return 'post_not_found'
  const key = and(
    eq(reactions.postSlug, input.slug),
    eq(reactions.userId, viewer.id),
    eq(reactions.emoji, input.emoji),
  )
  return db.transaction((tx) => {
    if (tx.delete(reactions).where(key).run().changes > 0) return 'off'
    tx.insert(reactions)
      .values({ postSlug: input.slug, userId: viewer.id, emoji: input.emoji, createdAt: new Date() })
      .run()
    return 'on'
  })
}
