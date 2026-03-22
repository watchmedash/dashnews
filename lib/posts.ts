import { Redis } from '@upstash/redis'

export interface Post {
  id: string
  title: string
  excerpt: string
  content: string
  tag: string
  author: string
  readTime: string
  imageUrl: string
  imageAlt: string
  createdAt: string
}

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const KEY = 'posts'

export async function getAllPosts(): Promise<Post[]> {
  try {
    const posts = await redis.get<Post[]>(KEY)
    if (!posts) return []
    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch {
    return []
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  const posts = await getAllPosts()
  return posts.find(p => p.id === id) ?? null
}

export async function savePost(post: Post): Promise<void> {
  const posts = await getAllPosts()
  const updated = [post, ...posts].slice(0, 72)
  await redis.set(KEY, updated)
}
