import { createServerFn } from '@tanstack/react-start'
import { db } from '#/server/db/client'
import { listPostReactions, togglePostReaction } from '#/server/reaction-store'
import { currentViewer, text } from '#/server/request'

export const listReactions = createServerFn({ method: 'GET' })
  .validator((slug: string) => text(slug))
  .handler(async ({ data: slug }) => listPostReactions(db, await currentViewer(), slug))

export const toggleReaction = createServerFn({ method: 'POST' })
  .validator((data: { slug: string; emoji: string }) => ({
    slug: text(data?.slug),
    emoji: text(data?.emoji),
  }))
  .handler(async ({ data }) => togglePostReaction(db, await currentViewer(), data))
