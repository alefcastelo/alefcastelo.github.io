import { fileURLToPath } from 'node:url'
import { serve } from 'srvx'
import { staticMiddleware } from 'srvx/static'
import handler from './dist/server/server.js'

const clientDir = fileURLToPath(new URL('./dist/client', import.meta.url))
const hashedAssets = staticMiddleware({ dir: clientDir, maxAge: 31536000, immutable: true })
const publicFiles = staticMiddleware({ dir: clientDir, maxAge: 600 })

serve({
  middleware: [
    (request, next) =>
      (new URL(request.url).pathname.startsWith('/assets/') ? hashedAssets : publicFiles)(
        request,
        next,
      ),
  ],
  fetch: handler.fetch,
  port: Number(process.env.PORT) || 3000,
  trustProxy: true,
})
