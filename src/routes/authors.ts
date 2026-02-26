import { Hono } from 'hono'
import { prisma } from '../prisma.js'
import { authorSchema, sanitizeStrings } from '../validation.js'
import { getPaging } from '../paging.js'

export const authors = new Hono()

authors.get('/', async (c) => {
  const paging = getPaging(c.req.query())
  if (!paging.ok) return c.json({ error: 'invalid paging' }, 400)

  const [data, total] = await Promise.all([
    prisma.author.findMany({
      orderBy: { id: 'desc' },
      take: paging.limit,
      skip: paging.offset,
    }),
    prisma.author.count(),
  ])

  return c.json({ data, paging: { limit: paging.limit, offset: paging.offset, total } })
})

authors.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id <= 0) return c.json({ error: 'invalid id' }, 400)

  const author = await prisma.author.findUnique({ where: { id } })
  if (!author) return c.json({ error: 'not found' }, 404)

  return c.json(author)
})

authors.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = authorSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'bad request', issues: parsed.error.issues }, 400)

  const data = sanitizeStrings(parsed.data)
  const created = await prisma.author.create({ data })

  return c.json(created, 201)
})

authors.put('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id <= 0) return c.json({ error: 'invalid id' }, 400)

  const body = await c.req.json().catch(() => null)
  const parsed = authorSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'bad request', issues: parsed.error.issues }, 400)

  const exists = await prisma.author.findUnique({ where: { id } })
  if (!exists) return c.json({ error: 'not found' }, 404)

  const data = sanitizeStrings(parsed.data)
  const updated = await prisma.author.update({ where: { id }, data })

  return c.json(updated)
})

authors.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id <= 0) return c.json({ error: 'invalid id' }, 400)

  const exists = await prisma.author.findUnique({ where: { id } })
  if (!exists) return c.json({ error: 'not found' }, 404)

  await prisma.author.delete({ where: { id } })
  return c.body(null, 204)
})