import fs from 'fs'
import path from 'path'

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

const DATA_FILE = path.join(process.cwd(), 'data', 'posts.json')

export function getAllPosts(): Post[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const posts: Post[] = JSON.parse(raw)
    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch {
    return []
  }
}

export function getPostById(id: string): Post | null {
  const posts = getAllPosts()
  return posts.find(p => p.id === id) ?? null
}

export function savePost(post: Post): void {
  const posts = getAllPosts()
  // Keep max 72 posts (3 days at 1/hour)
  const updated = [post, ...posts].slice(0, 72)
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2))
}
