import { describe, expect, it } from 'vitest'
import { listPosts } from '#/posts'
import { REACTION_EMOJIS } from '#/reactions/emojis'
import { reactions, user } from '#/server/db/schema'
import { createTestDb } from '#/server/db/test-db'
import { listPostReactions, togglePostReaction } from '#/server/reaction-store'
import type { Viewer } from '#/server/viewer'

const SLUG = listPosts()[0].slug

function setup() {
  const db = createTestDb()
  const reader = (name: string): Viewer => {
    const id = crypto.randomUUID()
    db.insert(user)
      .values({ id, name, email: `${name}@example.com`, emailVerified: true })
      .run()
    return { id, name, image: null, isAdmin: false }
  }
  return { db, reader }
}

describe('listPostReactions', () => {
  it('lists the 5 reactions in order with a zero count when nobody reacted', () => {
    const { db } = setup()
    expect(listPostReactions(db, null, SLUG)).toEqual([
      { emoji: '👍', count: 0, reactedByViewer: false },
      { emoji: '❤️', count: 0, reactedByViewer: false },
      { emoji: '🎉', count: 0, reactedByViewer: false },
      { emoji: '🤔', count: 0, reactedByViewer: false },
      { emoji: '👀', count: 0, reactedByViewer: false },
    ])
  })

  it('counts every reader on this post only, and marks the ones of the viewer', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    const bob = reader('bob')
    togglePostReaction(db, ada, { slug: SLUG, emoji: '👍' })
    togglePostReaction(db, bob, { slug: SLUG, emoji: '👍' })
    togglePostReaction(db, bob, { slug: SLUG, emoji: '🎉' })
    db.insert(reactions).values({ postSlug: 'another-post', userId: ada.id, emoji: '👀', createdAt: new Date() }).run()

    const byEmoji = (viewer: Viewer | null) =>
      Object.fromEntries(
        listPostReactions(db, viewer, SLUG).map((view) => [view.emoji, [view.count, view.reactedByViewer]]),
      )
    expect(byEmoji(ada)).toEqual({
      '👍': [2, true],
      '❤️': [0, false],
      '🎉': [1, false],
      '🤔': [0, false],
      '👀': [0, false],
    })
    expect(byEmoji(bob)['🎉']).toEqual([1, true])
    expect(Object.values(byEmoji(null)).every(([, mine]) => mine === false)).toBe(true)
  })
})

describe('togglePostReaction', () => {
  it('turns a reaction on, then off', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    expect(togglePostReaction(db, ada, { slug: SLUG, emoji: '❤️' })).toBe('on')
    expect(listPostReactions(db, ada, SLUG)[1]).toEqual({ emoji: '❤️', count: 1, reactedByViewer: true })
    expect(togglePostReaction(db, ada, { slug: SLUG, emoji: '❤️' })).toBe('off')
    expect(listPostReactions(db, ada, SLUG)[1]).toEqual({ emoji: '❤️', count: 0, reactedByViewer: false })
  })

  it('lets a reader use several different reactions on the same post, each once', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    for (const emoji of REACTION_EMOJIS) {
      expect(togglePostReaction(db, ada, { slug: SLUG, emoji })).toBe('on')
    }
    expect(listPostReactions(db, ada, SLUG).map((view) => view.count)).toEqual([1, 1, 1, 1, 1])
    expect(db.select().from(reactions).all()).toHaveLength(5)
  })

  it('refuses without a session', () => {
    const { db } = setup()
    expect(togglePostReaction(db, null, { slug: SLUG, emoji: '👍' })).toBe('unauthenticated')
    expect(db.select().from(reactions).all()).toEqual([])
  })

  it('refuses an emoji outside the set', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    for (const emoji of ['👎', '', '👍👍', 'thumbs up']) {
      expect(togglePostReaction(db, ada, { slug: SLUG, emoji }), emoji).toBe('invalid_emoji')
    }
    expect(db.select().from(reactions).all()).toEqual([])
  })

  it('refuses a slug that does not exist', () => {
    const { db, reader } = setup()
    expect(togglePostReaction(db, reader('ada'), { slug: 'no-such-post', emoji: '👍' })).toBe('post_not_found')
    expect(db.select().from(reactions).all()).toEqual([])
  })
})
