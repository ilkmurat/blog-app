export interface Post {
  slug: string
  title: string
  date: string
  author: string
  category: string
  tags: string[]
  excerpt: string
  content: string
  readingTime: number
}

const files = import.meta.glob('../posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: raw }
  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
  }
  return { data, body: match[2] }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const posts: Post[] = Object.entries(files)
  .map(([path, raw]) => {
    const { data, body } = parseFrontmatter(raw)
    const slug = path.split('/').pop()!.replace(/\.md$/, '')
    const words = body.split(/\s+/).filter(Boolean).length
    return {
      slug,
      title: data.title ?? slug,
      date: data.date ?? '',
      author: data.author ?? 'Anonymous',
      category: data.category ?? 'Uncategorized',
      tags: (data.tags ?? '')
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      excerpt: data.excerpt ?? body.slice(0, 160).replace(/[#*_`>]/g, '') + '…',
      content: body,
      readingTime: Math.max(1, Math.round(words / 200)),
    }
  })
  .sort((a, b) => b.date.localeCompare(a.date))

function countBy(keys: string[]): { name: string; slug: string; count: number }[] {
  const map = new Map<string, number>()
  for (const k of keys) map.set(k, (map.get(k) ?? 0) + 1)
  return [...map.entries()]
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

export const categories = countBy(posts.map((p) => p.category))
export const tags = countBy(posts.flatMap((p) => p.tags))

export const getPost = (slug: string) => posts.find((p) => p.slug === slug)
export const postsByCategory = (slug: string) => posts.filter((p) => slugify(p.category) === slug)
export const postsByTag = (slug: string) => posts.filter((p) => p.tags.some((t) => slugify(t) === slug))

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
