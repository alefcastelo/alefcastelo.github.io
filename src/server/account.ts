import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { deleteViewerAccount } from '#/server/account-store'
import { auth } from '#/server/auth'
import { db } from '#/server/db/client'

export const deleteAccount = createServerFn({ method: 'POST' }).handler(() =>
  deleteViewerAccount(db, auth, getRequestHeaders()),
)
