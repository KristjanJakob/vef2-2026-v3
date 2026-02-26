import { Hono } from 'hono'
import { prisma } from '../prisma.js'

export const authors = new Hono()

authors.get('/', async (c) => {
  const data = await prisma.author.findMany({
    orderBy: { id: 'asc' },
  })
  return c.json(data)
})

authors.get('/:id', async (c) => {
  const idParam = c.req.param('id')
  const id = Number(idParam)

  if (!Number.isInteger(id)) {
    return c.json({ error: 'bad request' }, 400)
  }

  const author = await prisma.author.findUnique({
    where: { id },
  })

  if (!author) {
    return c.json({ error: 'not found' }, 404)
  }

  return c.json(author)
})

authors.delete('/:id', async (c) => {
  const idParam = c.req.param('id')
  const id = Number(idParam)

  if (!Number.isInteger(id)) {
    return c.json({ error: 'bad request' }, 400)
  }

  const exists = await prisma.author.findUnique({ where: { id } })
  if (!exists) return c.json({ error: 'not found' }, 404)

  await prisma.author.delete({ where: { id } })
  return c.body(null, 204)
})