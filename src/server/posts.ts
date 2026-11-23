import { createServerFn } from '@tanstack/react-start'
import { findPost, listPosts } from '#/posts'

export const fetchPosts = createServerFn({ method: 'GET' }).handler(() => listPosts())

export const fetchPost = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(({ data: slug }) => findPost(slug))
