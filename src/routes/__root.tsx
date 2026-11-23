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
        <div className="relative mx-auto max-w-[680px] px-4 py-8 sm:py-12">
          {viewer && (
            <div className="absolute top-8 right-4 sm:top-12">
              <UserMenu viewer={viewer} />
            </div>
          )}
          {isHome ? <Bio /> : <SiteHeader />}
          {children}
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

function Bio() {
  return (
    <header className="mb-10 flex flex-col items-center border-b border-muted/25 pb-8 text-center">
      <Link to="/">
        <img
          src="/me.jpg"
          alt="Alef Castelo"
          width={128}
          height={128}
          className="size-32 rounded-full object-cover"
        />
      </Link>
      <Link to="/" className="mt-4 text-2xl font-semibold tracking-tight">
        Alef Castelo
      </Link>
      <p className="mt-3 max-w-[46ch] text-pretty text-muted">
        Software engineer based in Mexico City. I've been building backend
        systems for over a decade, from monoliths to microservices, with a soft
        spot for testing. Now I'm building Bidirekt.
      </p>
      <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
        {LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </header>
  )
}

function SiteHeader() {
  return (
    <header className="mb-10">
      <Link to="/" className="inline-flex items-center gap-3 font-semibold tracking-tight">
        <img
          src="/me.jpg"
          alt=""
          width={36}
          height={36}
          className="size-9 rounded-full object-cover"
        />
        Alef Castelo
      </Link>
    </header>
  )
}

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
        className="rounded-full"
      >
        <Avatar name={viewer.name} image={viewer.image} size={36} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-2 min-w-40 rounded-md border border-muted/25 bg-bg py-1 shadow-lg"
        >
          <p className="truncate px-4 py-2 text-sm text-muted">{viewer.name}</p>
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            className="block w-full px-4 py-2 text-left hover:bg-muted/10"
          >
            Sign out
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={removeAccount}
            className="block w-full px-4 py-2 text-left text-red-600 hover:bg-muted/10 dark:text-red-400"
          >
            Delete account
          </button>
          {failure && (
            <p role="alert" className="px-4 py-2 text-sm text-red-600 dark:text-red-400">
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
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-4 text-muted">
        <Link to="/" className="underline underline-offset-4">
          Back to home
        </Link>
      </p>
    </main>
  )
}
