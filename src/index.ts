import { Hono } from 'hono'
import 'dotenv/config'
import { serve } from '@hono/node-server'
import { prettyJSON } from 'hono/pretty-json'
import { authors } from './api/authors.api.js'
import { news } from './routes/news.js'

const app = new Hono()

const port = Number(process.env.PORT) || 3000

app.use(prettyJSON())

app.get('/', (c) =>
  c.json({
    '/authors': ['GET (paged)', 'GET /:id', 'POST', 'PUT /:id', 'DELETE /:id'],
    '/news': ['GET (paged)', 'GET /:slug', 'POST', 'PUT /:slug', 'DELETE /:slug'],
  }),
)

app.route('/authors', authors)
app.route('/news', news)

serve({ fetch: app.fetch, port: 3000 })

app.get('/', (c) =>
    c.json({
      '/authors': ['GET (paged)', 'GET /:id', 'POST', 'PUT /:id', 'DELETE /:id'],
      '/news': ['GET (paged)', 'GET /:slug', 'POST', 'PUT /:slug', 'DELETE /:slug'],
    }),
)

serve({
    fetch: app.fetch,
    port,
})

console.log(`Server running on port ${port}`)