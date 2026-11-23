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
      <ul aria-label="Reactions" className="flex flex-wrap gap-1">
        {reactions.map(({ emoji, count, reactedByViewer }) => (
          <li key={emoji}>
            <button
              type="button"
              aria-label={`React with ${emoji}, ${count}`}
              aria-pressed={reactedByViewer}
              disabled={pending}
              onClick={() => toggle(emoji)}
              className={`flex items-center gap-2 px-3 py-1.5 font-pixel text-2xl leading-none hover:bg-well ${
                reactedByViewer ? 'bg-well text-amber' : 'text-muted'
              }`}
            >
              <span aria-hidden="true" className="font-sans text-2xl leading-none">{emoji}</span>
              <span>{count}</span>
            </button>
          </li>
        ))}
      </ul>
      {askSignIn && (
        <p role="status" className="mt-3 text-sm">
          <a href="#comments" className="quiet">
            Sign in to react
          </a>
        </p>
      )}
      {failed && (
        <p role="alert" className="alert mt-3 text-sm">
          Couldn't save the reaction, try again
        </p>
      )}
    </div>
  )
}
