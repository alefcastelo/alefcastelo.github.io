import { describe, expect, it } from 'vitest'
import { renderCommentMarkdown } from '#/server/comment-markdown'

describe('renderCommentMarkdown', () => {
  it('renders bold, italic, links, inline code and code blocks', () => {
    const html = renderCommentMarkdown(
      '**bold** _italic_ [site](https://example.com) `code`\n\n```\nconst a = 1\n```',
    )
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<em>italic</em>')
    expect(html).toContain('<a href="https://example.com" rel="nofollow ugc noopener">site</a>')
    expect(html).toContain('<code>code</code>')
    expect(html).toContain('<pre><code>const a = 1\n</code></pre>')
  })

  it('removes <script> together with its content', () => {
    const html = renderCommentMarkdown('hello <script>alert("x")</script>')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('alert')
    expect(html).toContain('hello')
  })

  it('never renders raw HTML', () => {
    const html = renderCommentMarkdown(
      '<div onclick="steal()"><iframe src="https://evil.example"></iframe>text</div>',
    )
    expect(html).not.toMatch(/<(div|iframe)/)
    expect(html).not.toContain('onclick')
  })

  it('never renders images, in Markdown or in HTML', () => {
    const html = renderCommentMarkdown(
      '![alt](https://example.com/a.png) <img src="https://example.com/b.png" onerror="x()">',
    )
    expect(html).not.toContain('<img')
    expect(html).not.toContain('a.png')
  })

  it('refuses javascript: links', () => {
    const html = renderCommentMarkdown('[click](javascript:alert(1)) <a href="javascript:alert(2)">x</a>')
    expect(html).not.toContain('javascript:')
  })

  it('refuses links that are not http or https', () => {
    expect(renderCommentMarkdown('[mail](mailto:a@example.com)')).not.toContain('mailto:')
  })

  it('gives every link rel="nofollow ugc noopener", even when the reader writes another rel', () => {
    const html = renderCommentMarkdown(
      '<a href="https://example.com/raw" rel="author">raw</a> [md](http://example.com/md) https://example.com/auto',
    )
    const links = html.match(/<a [^>]*>/g) ?? []
    expect(links).toHaveLength(3)
    for (const link of links) expect(link).toContain('rel="nofollow ugc noopener"')
    expect(html).not.toContain('author')
  })
})
