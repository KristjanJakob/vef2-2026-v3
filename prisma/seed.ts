import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  // 3 authors (idempotent: safe to run multiple times)
  const authors = await Promise.all([
    prisma.author.upsert({
      where: { email: 'author1@example.org' },
      update: { name: 'author one' },
      create: { email: 'author1@example.org', name: 'author one' },
    }),
    prisma.author.upsert({
      where: { email: 'author2@example.org' },
      update: { name: 'author two' },
      create: { email: 'author2@example.org', name: 'author two' },
    }),
    prisma.author.upsert({
      where: { email: 'author3@example.org' },
      update: { name: 'author three' },
      create: { email: 'author3@example.org', name: 'author three' },
    }),
  ])

  const titles = Array.from({ length: 11 }, (_, i) => `Fake news title ${i + 1}`)

  for (const [i, title] of titles.entries()) {
    const slug = `${slugify(title)}-${i + 1}`
    const author = authors[i % authors.length]!
    await prisma.news.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        excerpt: `Excerpt for ${title}`,
        content: `Content for ${title}. Lorem ipsum dolor sit amet...`,
        published: i % 2 === 0,
        slug,
        authorId: author.id,
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })