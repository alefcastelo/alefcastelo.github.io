import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

const LINK_REL = 'nofollow ugc noopener'

/** Renders a reader's comment: basic Markdown only, no raw HTML or images, http(s) links only. */
export function renderCommentMarkdown(body: string): string {
  return sanitizeHtml(marked.parse(body, { async: false }), {
    allowedTags: ['p', 'br', 'strong', 'em', 'a', 'code', 'pre'],
    // sanitize-html drops attributes outside this list after transformTags, so `rel` must be in it.
    allowedAttributes: { a: ['href', 'rel'] },
    allowedSchemes: ['http', 'https'],
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, rel: LINK_REL } }),
    },
  })
}
