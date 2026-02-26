import { z } from 'zod'

const pagingSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
})

export function getPaging(query: Record<string, string | string[] | undefined>) {
  const parsed = pagingSchema.safeParse(query)
  if (!parsed.success) return { ok: false as const, error: parsed.error }
  return { ok: true as const, ...parsed.data }
}