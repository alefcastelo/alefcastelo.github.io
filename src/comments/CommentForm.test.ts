import { describe, expect, it } from 'vitest'
import { commentErrorMessage } from '#/comments/CommentForm'

describe('commentErrorMessage', () => {
  it.each([
    ['unauthenticated', 'Sign in to comment'],
    ['empty', 'Write something first'],
    ['too_long', 'Your comment is too long'],
    ['rate_limited', "You're commenting too fast, try again in a minute"],
    ['post_not_found', "Couldn't save the comment, try again"],
    ['anything_else', "Couldn't save the comment, try again"],
  ])('shows %s as "%s"', (code, message) => {
    expect(commentErrorMessage(code)).toBe(message)
  })
})
