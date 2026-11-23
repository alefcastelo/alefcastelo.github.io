import { useEffect, useState, type FormEvent } from 'react'

const MESSAGES: Record<string, string> = {
  unauthenticated: 'Sign in to comment',
  empty: 'Write something first',
  too_long: 'Your comment is too long',
  rate_limited: "You're commenting too fast, try again in a minute",
}
const FALLBACK = "Couldn't save the comment, try again"

/** What the reader reads for a refusal code from the server. */
export function commentErrorMessage(code: string): string {
  return MESSAGES[code] ?? FALLBACK
}

/** A comment box with a code-point counter. `onSubmit` returns `ok` or the server's refusal. */
export function CommentForm({
  label,
  submitLabel,
  maxLength,
  initialBody = '',
  autoFocus = false,
  onSubmit,
  onCancel,
}: {
  label: string
  submitLabel: string
  maxLength: number
  initialBody?: string
  autoFocus?: boolean
  onSubmit: (body: string) => Promise<'ok' | string>
  onCancel?: () => void
}) {
  const [body, setBody] = useState(initialBody)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Until React hydrates, a click would submit the form natively.
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const length = [...body].length
  const tooLong = length > maxLength

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      const result = await onSubmit(body)
      if (result === 'ok') setBody('')
      else setError(commentErrorMessage(result))
    } catch {
      setError(FALLBACK)
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <textarea
        aria-label={label}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        autoFocus={autoFocus}
        rows={3}
        className="field"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!hydrated || pending || tooLong}
          className="command"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="quiet text-sm">
            Cancel
          </button>
        )}
        <span
          className={`ml-auto font-pixel text-xl leading-none ${tooLong ? 'text-amber' : 'text-muted'}`}
        >
          {length}/{maxLength}
        </span>
      </div>
      {error && (
        <p role="alert" className="alert text-sm">
          {error}
        </p>
      )}
    </form>
  )
}
