import { describe, expect, it } from 'vitest'
import { listPosts } from '#/posts'
import { deleteUserAccount } from '#/server/account-store'
import { createPostComment, deletePostComment } from '#/server/comment-store'
import type { Db } from '#/server/db/client'
import { account, comments, session, user } from '#/server/db/schema'
import { commentIdOf as idOf, createTestDbWithReaders as setup } from '#/server/db/test-db'
import type { Viewer } from '#/server/viewer'

const SLUG = listPosts()[0].slug
const LIMITS = { maxLength: 280, ratePerMinute: 100 }

let clock = Date.UTC(2026, 10, 22)
function create(db: Db, viewer: Viewer, body: string, parent?: string) {
  clock += 1000
  const parentId = parent === undefined ? undefined : idOf(db, parent)
  expect(createPostComment(db, viewer, LIMITS, { slug: SLUG, body, parentId }, new Date(clock))).toBe('created')
}

/** Every comment left, as `body by author` with replies indented. */
function remaining(db: Db, readers: Viewer[]) {
  const name = (userId: string | null) => readers.find((reader) => reader.id === userId)?.name ?? 'nobody'
  return db
    .select()
    .from(comments)
    .all()
    .map((row) => `${row.parentId ? '  ' : ''}${row.body ?? '[deleted]'} by ${name(row.userId)}`)
}

describe('deleteUserAccount', () => {
  it('removes their replies and their comments without replies', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    const bob = reader('bob')
    create(db, ada, 'ada alone')
    create(db, bob, 'bob top')
    create(db, ada, 'ada reply', 'bob top')

    deleteUserAccount(db, ada.id)
    expect(remaining(db, [ada, bob])).toEqual(['bob top by bob'])
  })

  it('keeps their comment with replies from others as "[deleted]" without author', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    const bob = reader('bob')
    create(db, ada, 'ada top')
    create(db, bob, 'bob reply', 'ada top')

    deleteUserAccount(db, ada.id)
    expect(remaining(db, [ada, bob])).toEqual(['[deleted] by nobody', '  bob reply by bob'])
  })

  it('removes their comment whose only replies were their own', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    const bob = reader('bob')
    create(db, ada, 'ada top')
    create(db, ada, 'ada reply to herself', 'ada top')
    create(db, ada, 'ada top with bob')
    create(db, ada, 'ada reply next to bob', 'ada top with bob')
    create(db, bob, 'bob reply', 'ada top with bob')

    deleteUserAccount(db, ada.id)
    expect(remaining(db, [ada, bob])).toEqual(['[deleted] by nobody', '  bob reply by bob'])
  })

  it('removes the "[deleted]" of another reader when their reply was its last one', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    const bob = reader('bob')
    create(db, bob, 'bob top')
    create(db, ada, 'ada reply', 'bob top')
    deletePostComment(db, bob, idOf(db, 'bob top'))
    create(db, bob, 'bob other top')
    create(db, ada, 'ada other reply', 'bob other top')
    create(db, bob, 'bob reply', 'bob other top')
    deletePostComment(db, bob, idOf(db, 'bob other top'))

    deleteUserAccount(db, ada.id)
    expect(remaining(db, [ada, bob])).toEqual(['[deleted] by bob', '  bob reply by bob'])
  })

  it('removes the user, their sessions and provider links in cascade, and nobody else', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    const bob = reader('bob')
    for (const owner of [ada, bob]) {
      db.insert(session)
        .values({
          id: crypto.randomUUID(),
          token: crypto.randomUUID(),
          userId: owner.id,
          expiresAt: new Date(clock + 1000),
          updatedAt: new Date(clock),
        })
        .run()
      db.insert(account)
        .values({
          id: crypto.randomUUID(),
          accountId: owner.name,
          providerId: 'github',
          userId: owner.id,
          updatedAt: new Date(clock),
        })
        .run()
    }

    deleteUserAccount(db, ada.id)
    expect(db.select().from(user).all().map((row) => row.id)).toEqual([bob.id])
    expect(db.select().from(session).all().map((row) => row.userId)).toEqual([bob.id])
    expect(db.select().from(account).all().map((row) => row.userId)).toEqual([bob.id])
  })
})
