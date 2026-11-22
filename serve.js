import { fileURLToPath } from 'node:url'
import { serve } from 'srvx'
import { staticMiddleware } from 'srvx/static'
import handler from './dist/server/server.js'

const clientDir = fileURLToPath(new URL('./dist/client', import.meta.url))

serve({
  middleware: [staticMiddleware({ dir: clientDir })],
  fetch: handler.fetch,
  port: Number(process.env.PORT) || 3000,
})
