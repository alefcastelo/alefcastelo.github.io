import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import type { ReactionView } from '#/server/reaction-store'
import { toggleReaction } from '#/server/reactions'

export function ReactionBar({
  slug,
  reactions,
  signedIn,
}: {
  slug: string
  reactions: Array<ReactionView>
  signedIn: boolean
}) {
  const router = useRouter()
  const [askSignIn, setAskSignIn] = useState(false)
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  async function toggle(emoji: string) {
    if (!signedIn) {
      setAskSignIn(true)
      return
    }
    setPending(true)
    setFailed(false)
    try {
      const result = await toggleReaction({ data: { slug, emoji } })
      if (result === 'unauthenticated') setAskSignIn(true)
      await router.invalidate()
    } catch {
      setFailed(true)
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <ul aria-label="Reactions" className="flex flex-wrap gap-2">
        {reactions.map(({ emoji, count, reactedByViewer }) => (
          <li key={emoji}>
            <button
              type="button"
              aria-label={`React with ${emoji}, ${count}`}
              aria-pressed={reactedByViewer}
              disabled={pending}
              onClick={() => toggle(emoji)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm tabular-nums ${
                reactedByViewer ? 'border-text bg-muted/15 font-semibold' : 'border-muted/40 text-muted'
              }`}
            >
              <span aria-hidden="true">{emoji}</span>
              <span>{count}</span>
            </button>
          </li>
        ))}
      </ul>
      {askSignIn && (
        <p role="status" className="mt-2 text-sm">
          <a href="#comments" className="underline underline-offset-4">
            Sign in to react
          </a>
        </p>
      )}
      {failed && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          Couldn't save the reaction, try again
        </p>
      )}
    </div>
  )
}
