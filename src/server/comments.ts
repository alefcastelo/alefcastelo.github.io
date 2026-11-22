import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '#/server/auth'
import {
  createPostComment,
  deletePostComment,
  editPostComment,
  listPostComments,
} from '#/server/comment-store'
import { config } from '#/server/config'
import { db } from '#/server/db/client'
import { findViewer } from '#/server/viewer'

const limits = {
  maxLength: config.commentMaxLength,
  ratePerMinute: config.commentRatePerMinute,
}

const currentViewer = () => findViewer(auth, getRequestHeaders(), config.adminEmails)

const text = (value: unknown) => (typeof value === 'string' ? value : '')

export const listComments = createServerFn({ method: 'GET' })
  .validator((slug: string) => text(slug))
  .handler(async ({ data: slug }) => listPostComments(db, await currentViewer(), slug))

export const getCommentMaxLength = createServerFn({ method: 'GET' }).handler(
  () => limits.maxLength,
)

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
