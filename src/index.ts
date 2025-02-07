import {fromHono} from "chanfana"
import {Hono} from "hono"
import {CloudFlareYes} from "./endpoints/cloudFlareYes"

// Start a Hono app
const app = new Hono()

// Setup OpenAPI registry
const openapi = fromHono(app, {
    docs_url: "/doc"
})

// Register OpenAPI endpoints
openapi.get('/CloudFlareYes', CloudFlareYes)

// Export the Hono app
export default app
