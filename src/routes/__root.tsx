import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { Avatar } from '#/Avatar'
import { deleteAccount } from '#/server/account'
import { getViewer, type Viewer } from '#/server/viewer'
import appCss from '#/styles.css?url'

export const Route = createRootRoute({
  beforeLoad: async () => ({ viewer: await getViewer() }),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Alef Castelo' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootShell,
})

function RootShell({ children }: { children: ReactNode }) {
  const isHome = useRouterState({
    select: (state) => state.matches.some((match) => match.routeId === '/'),
  })
  const viewer = Route.useRouteContext({ select: (context) => context.viewer })
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="mx-auto max-w-[1120px] px-4 pt-6 pb-16 sm:px-10 sm:pt-10">
          <header className="flex items-center justify-between gap-6">
            {isHome ? (
              <span />
            ) : (
              <Link
                to="/"
                className="font-pixel text-[22px] leading-none tracking-[0.08em] whitespace-nowrap text-ivory uppercase hover:text-amber sm:text-[28px]"
              >
                Alef Castelo
              </Link>
            )}
            <div className="flex items-center gap-4 sm:gap-7">
              <ul className="flex gap-3 font-pixel text-[20px] leading-none sm:gap-6 sm:text-[22px]">
                {LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted lowercase hover:text-amber"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              {viewer && <UserMenu viewer={viewer} />}
            </div>
          </header>
          <div className="mt-14 sm:mt-24">{children}</div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/alefcastelo' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/alefcastelo' },
  { label: 'Bidirekt', href: 'https://bidirekt.com' },
]

const DELETE_ACCOUNT_WARNING =
  'This deletes your account and reactions. Comments with replies stay as [deleted].'
const SIGN_OUT_FAILED = "Couldn't sign out, try again"
const DELETE_ACCOUNT_FAILED = "Couldn't delete the account, try again"

function UserMenu({ viewer }: { viewer: Viewer }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  async function signOut() {
    setFailure(null)
    try {
      const { authClient } = await import('#/auth-client')
      const { error } = await authClient.signOut()
      if (error) return setFailure(SIGN_OUT_FAILED)
    } catch {
      return setFailure(SIGN_OUT_FAILED)
    }
    setOpen(false)
    await router.invalidate()
  }

  async function removeAccount() {
    if (!window.confirm(DELETE_ACCOUNT_WARNING)) return
    setFailure(null)
    try {
      await deleteAccount()
    } catch {
      return setFailure(DELETE_ACCOUNT_FAILED)
    }
    setOpen(false)
    await router.invalidate()
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={`Account menu for ${viewer.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Avatar name={viewer.name} image={viewer.image} size={36} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-3 min-w-48 bg-well py-1 shadow-[0_12px_32px_rgb(0_0_0/0.7)]"
        >
          <p className="truncate px-4 py-2 text-sm text-muted">{viewer.name}</p>
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            className="block w-full px-4 py-2 text-left text-ivory hover:text-amber"
          >
            Sign out
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={removeAccount}
            className="block w-full px-4 py-2 text-left text-muted hover:text-amber"
          >
            Delete account
          </button>
          {failure && (
            <p role="alert" className="alert px-4 py-2 text-sm">
              {failure}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function NotFound() {
  return (
    <main>
      <p aria-hidden="true" className="font-pixel text-[clamp(96px,22vw,200px)] leading-[0.8] text-ash">404</p>
      <h1 className="mt-8 font-pixel text-5xl leading-none text-ivory">
        Page not found<span aria-hidden="true" className="caret ml-2" />
      </h1>
      <p className="mt-6">
        <Link to="/" className="quiet">
          Back to home
        </Link>
      </p>
    </main>
  )
}
