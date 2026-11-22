import { describe, expect, it } from 'vitest'
import { listPosts } from '#/posts'
import {
  createPostComment,
  deletePostComment,
  editPostComment,
  listPostComments,
  type CommentLimits,
} from '#/server/comment-store'
import type { Db } from '#/server/db/client'
import { comments, user } from '#/server/db/schema'
import { createTestDb } from '#/server/db/test-db'
import type { Viewer } from '#/server/viewer'

const SLUG = listPosts()[0].slug
const LIMITS: CommentLimits = { maxLength: 280, ratePerMinute: 100 }

function setup() {
  const db = createTestDb()
  const reader = (name: string, isAdmin = false): Viewer => {
    const id = crypto.randomUUID()
    const image = `https://example.com/${name}.png`
    db.insert(user)
      .values({ id, name, email: `${name}@example.com`, emailVerified: true, image })
      .run()
    return { id, name, image, isAdmin }
  }
  return { db, reader }
}

let clock = Date.UTC(2026, 10, 22)
/** Each call is one second after the previous one, so the order of creation is unambiguous. */
function tick() {
  clock += 1000
  return new Date(clock)
}

function create(db: Db, viewer: Viewer | null, body: string, extra: { parentId?: string; slug?: string } = {}) {
  return createPostComment(db, viewer, LIMITS, { slug: SLUG, body, ...extra }, tick())
}

function idOf(db: Db, body: string) {
  return db.select().from(comments).all().find((row) => row.body === body)!.id
}

describe('listPostComments', () => {
  it('lists top-level comments oldest first, each followed by its replies oldest first', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    create(db, ada, 'first')
    create(db, ada, 'second')
    create(db, ada, 'reply to second', { parentId: idOf(db, 'second') })
    create(db, ada, 'reply to first', { parentId: idOf(db, 'first') })
    create(db, ada, 'another reply to first', { parentId: idOf(db, 'first') })

    const bodies = listPostComments(db, null, SLUG).map((view) => view.html)
    expect(bodies).toEqual([
      '<p>first</p>\n',
      '<p>reply to first</p>\n',
      '<p>another reply to first</p>\n',
      '<p>second</p>\n',
      '<p>reply to second</p>\n',
    ])
  })

  it('returns the R5 shape, with rendered HTML and no user id or email', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    create(db, ada, '**hi**')
    const [view] = listPostComments(db, null, SLUG)
    expect(view).toEqual({
      id: expect.any(String),
      parentId: null,
      html: '<p><strong>hi</strong></p>\n',
      markdown: null,
      createdAt: clock,
      editedAt: null,
      author: { name: 'ada', image: 'https://example.com/ada.png' },
      canEdit: false,
      canDelete: false,
    })
    expect(JSON.stringify(view)).not.toContain(ada.id)
    expect(JSON.stringify(view)).not.toContain('@example.com')
  })

  it('only lists the comments of the given post', () => {
    const { db, reader } = setup()
    create(db, reader('ada'), 'hello')
    expect(listPostComments(db, null, 'another-post')).toEqual([])
  })
})

describe('createPostComment', () => {
  it('stores the raw text of a signed-in reader', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    expect(create(db, ada, '  _hello_  ')).toBe('created')
    const [row] = db.select().from(comments).all()
    expect(row).toMatchObject({ postSlug: SLUG, userId: ada.id, parentId: null, body: '  _hello_  ' })
  })

  it('refuses a reader without a session', () => {
    const { db } = setup()
    expect(create(db, null, 'hello')).toBe('unauthenticated')
    expect(db.select().from(comments).all()).toEqual([])
  })

  it('refuses empty text, whitespace-only text and text that is empty once sanitized', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    for (const body of ['', '   \n\t ', '<script>alert(1)</script>', '![](https://example.com/a.png)']) {
      expect(create(db, ada, body), JSON.stringify(body)).toBe('empty')
    }
    expect(db.select().from(comments).all()).toEqual([])
  })

  it('counts the maximum length in code points', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    const limits = { ...LIMITS, maxLength: 3 }
    const input = (body: string) => ({ slug: SLUG, body })
    expect(createPostComment(db, ada, limits, input('👍👍👍'), tick())).toBe('created')
    expect(createPostComment(db, ada, limits, input('👍👍👍👍'), tick())).toBe('too_long')
    expect(createPostComment(db, ada, limits, input('abcd'), tick())).toBe('too_long')
  })

  it('refuses a slug that does not exist', () => {
    const { db, reader } = setup()
    expect(create(db, reader('ada'), 'hello', { slug: 'no-such-post' })).toBe('post_not_found')
  })

  it('refuses a parent from another post, or one that does not exist', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    db.insert(comments)
      .values({ id: 'elsewhere', postSlug: 'another-post', userId: ada.id, body: 'x', createdAt: tick() })
      .run()
    expect(create(db, ada, 'reply', { parentId: 'elsewhere' })).toBe('invalid_parent')
    expect(create(db, ada, 'reply', { parentId: 'missing' })).toBe('invalid_parent')
  })

  it('hangs a reply to a reply from the top-level comment', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    create(db, ada, 'top')
    const top = idOf(db, 'top')
    create(db, ada, 'reply', { parentId: top })
    expect(create(db, ada, 'reply to reply', { parentId: idOf(db, 'reply') })).toBe('created')
    expect(db.select().from(comments).all().find((row) => row.body === 'reply to reply')?.parentId).toBe(top)
  })

  it('refuses a reader who already has the rate of comments in the last 60 seconds', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    const bob = reader('bob')
    const limits = { ...LIMITS, ratePerMinute: 2 }
    const at = (ms: number) => new Date(Date.UTC(2027, 0, 1) + ms)
    const input = { slug: SLUG, body: 'hello' }

    expect(createPostComment(db, ada, limits, input, at(0))).toBe('created')
    expect(createPostComment(db, ada, limits, input, at(30_000))).toBe('created')
    expect(createPostComment(db, ada, limits, input, at(59_999))).toBe('rate_limited')
    expect(createPostComment(db, bob, limits, input, at(59_999)), 'another reader').toBe('created')
    expect(createPostComment(db, ada, limits, input, at(60_000)), 'the first one left the window').toBe(
      'created',
    )
    expect(db.select().from(comments).all()).toHaveLength(4)
  })
})

describe('permissions in listPostComments', () => {
  it('lets the author edit and delete, an admin only delete, and others neither', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    create(db, ada, '_mine_')
    const permissions = (viewer: Viewer | null) => {
      const [view] = listPostComments(db, viewer, SLUG)
      return { canEdit: view.canEdit, canDelete: view.canDelete, markdown: view.markdown }
    }
    expect(permissions(ada)).toEqual({ canEdit: true, canDelete: true, markdown: '_mine_' })
    expect(permissions(reader('root', true))).toEqual({ canEdit: false, canDelete: true, markdown: null })
    expect(permissions(reader('bob'))).toEqual({ canEdit: false, canDelete: false, markdown: null })
    expect(permissions(null)).toEqual({ canEdit: false, canDelete: false, markdown: null })
  })

  it('shows a "[deleted]" comment without author, text or actions', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    create(db, ada, 'top')
    create(db, reader('bob'), 'reply', { parentId: idOf(db, 'top') })
    deletePostComment(db, ada, idOf(db, 'top'))
    const [top] = listPostComments(db, reader('root', true), SLUG)
    expect(top).toMatchObject({ html: null, markdown: null, author: null, canEdit: false, canDelete: false })
  })
})

describe('editPostComment', () => {
  it('lets the author edit, and records editedAt', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    create(db, ada, 'before')
    const at = tick()
    expect(editPostComment(db, ada, LIMITS, { id: idOf(db, 'before'), body: 'after' }, at)).toBe('edited')
    const [view] = listPostComments(db, null, SLUG)
    expect(view).toMatchObject({ html: '<p>after</p>\n', editedAt: at.getTime() })
  })

  it('refuses anyone but the author, the admin included, and a reader without a session', () => {
    const { db, reader } = setup()
    create(db, reader('ada'), 'original')
    const id = idOf(db, 'original')
    expect(editPostComment(db, reader('bob'), LIMITS, { id, body: 'hijacked' })).toBe('forbidden')
    expect(editPostComment(db, reader('root', true), LIMITS, { id, body: 'hijacked' })).toBe('forbidden')
    expect(editPostComment(db, null, LIMITS, { id, body: 'hijacked' })).toBe('unauthenticated')
    expect(db.select().from(comments).get()).toMatchObject({ body: 'original', editedAt: null })
  })

  it('applies the text rules of a new comment', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    create(db, ada, 'original')
    const id = idOf(db, 'original')
    expect(editPostComment(db, ada, LIMITS, { id, body: '  ' })).toBe('empty')
    expect(editPostComment(db, ada, LIMITS, { id, body: '<script>x</script>' })).toBe('empty')
    expect(editPostComment(db, ada, { maxLength: 3 }, { id, body: 'abcd' })).toBe('too_long')
    expect(db.select().from(comments).get()?.body).toBe('original')
  })

  it('refuses to edit a "[deleted]" comment or one that does not exist', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    create(db, ada, 'top')
    create(db, reader('bob'), 'reply', { parentId: idOf(db, 'top') })
    const id = idOf(db, 'top')
    deletePostComment(db, ada, id)
    expect(editPostComment(db, ada, LIMITS, { id, body: 'back' })).toBe('deleted')
    expect(editPostComment(db, ada, LIMITS, { id: 'missing', body: 'x' })).toBe('not_found')
  })
})

describe('deletePostComment', () => {
  it('removes a comment without replies completely', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    create(db, ada, 'alone')
    expect(deletePostComment(db, ada, idOf(db, 'alone'))).toBe('deleted')
    expect(db.select().from(comments).all()).toEqual([])
  })

  it('keeps a comment with replies as "[deleted]", with its author, and the replies visible', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    create(db, ada, 'top')
    const id = idOf(db, 'top')
    create(db, reader('bob'), 'reply', { parentId: id })
    expect(deletePostComment(db, ada, id)).toBe('deleted')
    const top = db.select().from(comments).all().find((row) => row.id === id)
    expect(top).toMatchObject({ body: null, userId: ada.id })
    expect(listPostComments(db, null, SLUG).map((view) => view.html)).toEqual([null, '<p>reply</p>\n'])
  })

  it('removes a "[deleted]" comment along with its last reply', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    const bob = reader('bob')
    create(db, ada, 'top')
    const top = idOf(db, 'top')
    create(db, bob, 'first reply', { parentId: top })
    create(db, bob, 'last reply', { parentId: top })
    deletePostComment(db, ada, top)

    deletePostComment(db, bob, idOf(db, 'first reply'))
    expect(db.select().from(comments).all().map((row) => row.body)).toEqual([null, 'last reply'])

    deletePostComment(db, bob, idOf(db, 'last reply'))
    expect(db.select().from(comments).all()).toEqual([])
  })

  it('keeps a live parent when its last reply is deleted', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    create(db, ada, 'top')
    create(db, ada, 'reply', { parentId: idOf(db, 'top') })
    deletePostComment(db, ada, idOf(db, 'reply'))
    expect(db.select().from(comments).all().map((row) => row.body)).toEqual(['top'])
  })

  it('lets an admin delete anyone\'s comment', () => {
    const { db, reader } = setup()
    create(db, reader('ada'), 'spam')
    expect(deletePostComment(db, reader('root', true), idOf(db, 'spam'))).toBe('deleted')
    expect(db.select().from(comments).all()).toEqual([])
  })

  it('refuses another reader, a reader without a session, and a comment already deleted', () => {
    const { db, reader } = setup()
    const ada = reader('ada')
    create(db, ada, 'top')
    const id = idOf(db, 'top')
    expect(deletePostComment(db, reader('bob'), id)).toBe('forbidden')
    expect(deletePostComment(db, null, id)).toBe('unauthenticated')
    expect(db.select().from(comments).all()).toHaveLength(1)

    create(db, reader('carol'), 'reply', { parentId: id })
    deletePostComment(db, ada, id)
    expect(deletePostComment(db, ada, id), 'already "[deleted]"').toBe('not_found')
    expect(deletePostComment(db, ada, 'missing')).toBe('not_found')
  })
})
