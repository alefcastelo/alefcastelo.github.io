import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '#/server/auth'
import { config } from '#/server/config'
import { db } from '#/server/db/client'
import { listPostReactions, togglePostReaction } from '#/server/reaction-store'
import { findViewer } from '#/server/viewer'

const currentViewer = () => findViewer(auth, getRequestHeaders(), config.adminEmails)

const text = (value: unknown) => (typeof value === 'string' ? value : '')

export const listReactions = createServerFn({ method: 'GET' })
  .validator((slug: string) => text(slug))
  .handler(async ({ data: slug }) => listPostReactions(db, await currentViewer(), slug))

export const toggleReaction = createServerFn({ method: 'POST' })
  .validator((data: { slug: string; emoji: string }) => ({
    slug: text(data?.slug),
    emoji: text(data?.emoji),
  }))
  .handler(async ({ data }) => togglePostReaction(db, await currentViewer(), data))
