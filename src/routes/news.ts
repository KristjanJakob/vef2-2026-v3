import { Hono } from 'hono'
import { prisma } from '../prisma.js'
import { newsSchema, sanitizeStrings } from '../validation.js'
import { getPaging } from '../paging.js'
import { slugify } from '../slug.js'

export const news = new Hono()

news.get('/', async (c) => {
  const paging = getPaging(c.req.query())
  if (!paging.ok) return c.json({ error: 'invalid paging' }, 400)

  const [data, total] = await Promise.all([
    prisma.news.findMany({
      orderBy: { published: 'desc' },
      take: paging.limit,
      skip: paging.offset,
      include: { Author: true },
    }),
    prisma.news.count(),
  ])

  return c.json({ data, paging: { limit: paging.limit, offset: paging.offset, total } })
})

news.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const item = await prisma.news.findUnique({
    where: { slug },
    include: { Author: true },
  })
  if (!item) return c.json({ error: 'not found' }, 404)
  return c.json(item)
})

news.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = newsSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'bad request', issues: parsed.error.issues }, 400)

  const sanitized = sanitizeStrings(parsed.data)
  const slug = slugify(sanitized.title)

  const created = await prisma.news.create({
    data: { ...sanitized, slug },
  })

  return c.json(created, 201)
})

news.put('/:slug', async (c) => {
  const slug = c.req.param('slug')

  const body = await c.req.json().catch(() => null)
  const parsed = newsSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'bad request', issues: parsed.error.issues }, 400)

  const exists = await prisma.news.findUnique({ where: { slug } })
  if (!exists) return c.json({ error: 'not found' }, 404)

  const sanitized = sanitizeStrings(parsed.data)
  const newSlug = slugify(sanitized.title)

  const updated = await prisma.news.update({
    where: { slug },
    data: { ...sanitized, slug: newSlug },
  })

  return c.json(updated)
})

news.delete('/:slug', async (c) => {
  const slug = c.req.param('slug')

  const exists = await prisma.news.findUnique({ where: { slug } })
  if (!exists) return c.json({ error: 'not found' }, 404)

  await prisma.news.delete({ where: { slug } })
  return c.body(null, 204)
})