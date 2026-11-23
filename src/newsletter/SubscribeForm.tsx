import { useState, type FormEvent } from 'react'
import { useHydrated } from '@tanstack/react-router'
import { subscribe } from '#/server/newsletter'
import type { SubscribeResult } from '#/server/subscribe-email'

const MESSAGES: Record<SubscribeResult, string> = {
  subscribed: "Thanks — you're subscribed.",
  invalid_email: 'Enter a valid email',
  rate_limited: 'Too many attempts, try again later',
}

export function SubscribeForm() {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  // Until React hydrates, a click would submit the form natively and put the email in the URL.
  const hydrated = useHydrated()

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const email = String(new FormData(form).get('email') ?? '')
    setPending(true)
    setMessage('')
    try {
      const outcome = await subscribe({ data: { email } })
      setMessage(MESSAGES[outcome])
      if (outcome === 'subscribed') form.reset()
    } catch {
      setMessage('Something went wrong, try again')
    } finally {
      setPending(false)
    }
  }

  return (
    <section>
      <h2 className="font-pixel text-[32px] leading-none text-ivory">Get new posts by email</h2>
      <form noValidate onSubmit={onSubmit} className="group mt-5 flex items-center gap-3 font-pixel text-2xl leading-none">
        <span aria-hidden="true" className="h-[0.8em] w-[0.5em] shrink-0 bg-ash group-focus-within:bg-amber" />
        <input
          type="email"
          name="email"
          aria-label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          className="min-w-0 flex-1 bg-transparent py-2 text-ivory placeholder:text-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={!hydrated || pending}
          className="shrink-0 py-2 text-ivory hover:text-amber disabled:text-muted"
        >
          <span aria-hidden="true" className="mr-2 text-amber">
            &gt;
          </span>
          Subscribe
        </button>
      </form>
      <p role="status" className="mt-2 min-h-6 text-sm text-muted">
        {message}
      </p>
    </section>
  )
}
