import { useEffect, useState, type FormEvent } from 'react'
import { subscribe } from '#/server/newsletter'
import type { SubscribeResult } from '#/server/subscribe-email'

const MESSAGES: Record<SubscribeResult, string> = {
  subscribed: "Thanks — you're subscribed.",
  invalid_email: 'Enter a valid email',
  rate_limited: 'Too many attempts, try again later',
}

export function SubscribeForm() {
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<SubscribeResult | null>(null)
  // Until React hydrates, a click would submit the form natively and put the email in the URL.
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const email = String(new FormData(form).get('email') ?? '')
    setPending(true)
    try {
      const outcome = await subscribe({ data: { email } })
      setResult(outcome)
      if (outcome === 'subscribed') form.reset()
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="border-t border-muted/25 pt-8">
      <h2 className="font-semibold tracking-tight">Get new posts by email</h2>
      <form noValidate onSubmit={onSubmit} className="mt-3 flex flex-wrap gap-2">
        <input
          type="email"
          name="email"
          aria-label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          className="min-w-0 flex-1 rounded-sm border border-muted/40 bg-transparent px-3 py-2"
        />
        <button
          type="submit"
          disabled={!hydrated || pending}
          className="rounded-sm bg-text px-4 py-2 font-medium text-bg disabled:opacity-60"
        >
          Subscribe
        </button>
      </form>
      <p role="status" className="mt-2 min-h-6 text-sm text-muted">
        {result && MESSAGES[result]}
      </p>
    </section>
  )
}
