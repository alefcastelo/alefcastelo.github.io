import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '#/server/auth'
import { config } from '#/server/config'
import { findViewer } from '#/server/viewer'

// Only server function files import this module, and only inside validators and handlers,
// which the client build replaces with RPC calls: so none of it reaches the browser.

/** The signed-in reader of the current request, or null. */
export const currentViewer = () => findViewer(auth, getRequestHeaders(), config.adminEmails)

/** A request field as a string: anything else becomes ''. */
export const text = (value: unknown) => (typeof value === 'string' ? value : '')
