import type { ReactNode } from 'react'
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
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
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="mx-auto max-w-[680px] px-4 py-12 sm:py-20">
          <header className="mb-16">
            <Link to="/" className="font-semibold tracking-tight">
              Alef Castelo
            </Link>
          </header>
          {children}
        </div>
        <Scripts />
      </body>
    </html>
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
