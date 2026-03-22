import Image from 'next/image'
import Link from 'next/link'
import { Post } from '@/lib/posts'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor(diff / 60000)
  if (h >= 24) return `${Math.floor(h / 24)}d ago`
  if (h >= 1) return `${h}h ago`
  return `${Math.max(1, m)}m ago`
}

export default function PostCard({ post, large = false }: { post: Post; large?: boolean }) {
  return (
    <Link href={`/post/${post.id}`} className={`card${large ? ' large' : ''}`}>
      <div className="card-img">
        <Image
          src={post.imageUrl}
          alt={post.imageAlt}
          width={large ? 800 : 600}
          height={large ? 280 : 200}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          unoptimized
        />
      </div>
      <div className="card-body">
        <span className="card-tag">{post.tag}</span>
        <div className="card-title">{post.title}</div>
        <div className="card-excerpt">{post.excerpt}</div>
        <div className="card-meta">
          {timeAgo(post.createdAt)} &bull; {post.readTime} &bull; {post.author}
        </div>
      </div>
    </Link>
  )
}
