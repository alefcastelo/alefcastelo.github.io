import { useEffect, useState, type FormEvent } from 'react'

const MESSAGES: Record<string, string> = {
  unauthenticated: 'Sign in to comment',
  empty: 'Write something first',
  too_long: 'Your comment is too long',
  rate_limited: "You're commenting too fast, try again in a minute",
}
const FALLBACK = "Couldn't save the comment, try again"

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
    try {
      const result = await onSubmit(body)
      if (result === 'ok') {
        setBody('')
        setError(null)
      } else {
        setError(MESSAGES[result] ?? FALLBACK)
      }
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
        className="w-full rounded-sm border border-muted/40 bg-transparent px-3 py-2"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!hydrated || pending || tooLong}
          className="rounded-sm bg-text px-4 py-1.5 font-medium text-bg disabled:opacity-60"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-muted underline underline-offset-4">
            Cancel
          </button>
        )}
        <span
          className={`ml-auto text-sm tabular-nums ${tooLong ? 'font-semibold text-red-600 dark:text-red-400' : 'text-muted'}`}
        >
          {length}/{maxLength}
        </span>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </form>
  )
}
