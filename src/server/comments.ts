import { createServerFn } from '@tanstack/react-start'
import {
  createPostComment,
  deletePostComment,
  editPostComment,
  listPostComments,
} from '#/server/comment-store'
import { config } from '#/server/config'
import { db } from '#/server/db/client'
import { currentViewer, text } from '#/server/request'

const limits = {
  maxLength: config.commentMaxLength,
  ratePerMinute: config.commentRatePerMinute,
}

export const listComments = createServerFn({ method: 'GET' })
  .validator((slug: string) => text(slug))
  .handler(async ({ data: slug }) => ({
    comments: listPostComments(db, await currentViewer(), slug),
    commentMaxLength: limits.maxLength,
  }))

export const createComment = createServerFn({ method: 'POST' })
  .validator((data: { slug: string; body: string; parentId?: string | null }) => ({
    slug: text(data?.slug),
    body: text(data?.body),
    parentId: text(data?.parentId) || null,
  }))
  .handler(async ({ data }) => createPostComment(db, await currentViewer(), limits, data))

export const editComment = createServerFn({ method: 'POST' })
  .validator((data: { id: string; body: string }) => ({
    id: text(data?.id),
    body: text(data?.body),
  }))
  .handler(async ({ data }) => editPostComment(db, await currentViewer(), limits, data))

export const deleteComment = createServerFn({ method: 'POST' })
  .validator((id: string) => text(id))
  .handler(async ({ data: id }) => deletePostComment(db, await currentViewer(), id))
