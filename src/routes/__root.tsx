import type { ReactNode } from 'react'
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router'
import appCss from '#/styles.css?url'

export const Route = createRootRoute({
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
    select: (state) => state.location.pathname === '/',
  })
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="mx-auto max-w-[680px] px-4 py-8 sm:py-12">
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

export function NotFound() {
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
