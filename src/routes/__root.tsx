import type { ReactNode } from 'react'
import { HeadContent, Link, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
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
    select: (state) => state.matches.some((match) => match.routeId === '/'),
  })
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

export function NotFound() {
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
