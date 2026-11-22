import { marked } from 'marked'
import { parseFrontmatter } from '#/frontmatter'

export type PostSummary = {
  slug: string
  title: string
  description: string
  date: string
  thumbnail: string | null
}

export type Post = PostSummary & { html: string }

const FILE_NAME = /([^/]+)\.md$/

const rawFiles = import.meta.glob<string>('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const POSTS: Array<Post> = Object.entries(rawFiles)
  .map(([path, raw]) => postFromMarkdown(path, raw))
  .sort((left, right) => right.date.localeCompare(left.date))

export function listPosts(): Array<PostSummary> {
  return POSTS.map(({ html: _html, ...summary }) => summary)
}

export function findPost(slug: string): Post | null {
  return POSTS.find((post) => post.slug === slug) ?? null
}

export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function postFromMarkdown(path: string, raw: string): Post {
  const slug = FILE_NAME.exec(path)?.[1]
  const { meta, body } = parseFrontmatter(raw)
  const { title, description, date, thumbnail = null } = meta
  if (!slug || !title || !description || !date) {
    throw new Error(`${path}: frontmatter needs title, description and date`)
  }
  return {
    slug,
    title,
    description,
    date,
    thumbnail,
    html: marked.parse(body, { async: false }),
  }
}
