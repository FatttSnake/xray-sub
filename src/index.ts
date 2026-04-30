import { fromHono } from 'chanfana'
import { Hono } from 'hono'
import { CloudFlareYes } from './endpoints/cloudFlareYes'
import { ApiUouinCom } from './endpoints/apiUouinCom'

// Start a Hono app
const app = new Hono()

// Setup OpenAPI registry
const openapi = fromHono(app, {
    docs_url: '/doc'
})

// Register OpenAPI endpoints
openapi.get('/CloudFlareYes', CloudFlareYes)
openapi.get('/ApiUouinCom', ApiUouinCom)

// Export the Hono app
export default app
