import { z } from 'zod'
import xss from 'xss'

const MAX_NAME = 100
const MAX_EMAIL = 200
const MAX_TITLE = 200
const MAX_EXCERPT = 500

export const authorSchema = z.object({
  name: z.string().min(1).max(MAX_NAME),
  email: z.string().email().max(MAX_EMAIL),
})

export const newsSchema = z.object({
  title: z.string().min(1).max(MAX_TITLE),
  excerpt: z.string().min(1).max(MAX_EXCERPT),
  content: z.string().min(1),
  authorId: z.number().int().positive(),
  published: z.boolean(),
})

export function sanitizeStrings<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = { ...obj }
  for (const [k, v] of Object.entries(out)) {
    if (typeof v === 'string') out[k] = xss(v)
  }
  return out as T
}