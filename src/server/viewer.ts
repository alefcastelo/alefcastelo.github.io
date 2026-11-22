import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth, type Auth } from '#/server/auth'
import { config } from '#/server/config'

/** What the browser may know about the signed-in reader. Never the email. */
export type Viewer = { id: string; name: string; image: string | null; isAdmin: boolean }

export async function findViewer(
  auth: Auth,
  headers: Headers,
  adminEmails: string[],
): Promise<Viewer | null> {
  const session = await auth.api.getSession({ headers })
  if (!session) return null
  const { id, name, image, email } = session.user
  const isAdmin = adminEmails.some((admin) => admin.toLowerCase() === email.toLowerCase())
  return { id, name, image: image ?? null, isAdmin }
}

export const getViewer = createServerFn({ method: 'GET' }).handler(() =>
  findViewer(auth, getRequestHeaders(), config.adminEmails),
)
