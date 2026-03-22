import { getPostById, getAllPosts } from '@/lib/posts'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PostCard from '@/components/PostCard'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await getPostById(params.id)
  if (!post) return notFound()
  return {
    title: `${post.title} — DashNews`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://dashnews.top/post/${post.id}`,
      siteName: 'DashNews',
      images: [{ url: post.imageUrl, width: 1200, height: 630, alt: post.title }],
      type: 'article',
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.imageUrl],
    },
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id)
  if (!post) notFound()

  const related = await getAllPosts()
    .filter(p => p.tag === post.tag && p.id !== post.id)
    .slice(0, 3)

  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <main>
      <div className="post-container">
        <Link href="/" className="back-btn">← Back to Home</Link>
        <h1 className="post-title">{post.title}</h1>
        <span className="post-tag">{post.tag}</span>
        <div className="post-meta">
          <span>✍️ {post.author}</span>
          <span>📅 {date}</span>
          <span>⏱ {post.readTime}</span>
        </div>
        <hr className="post-divider" />
        <div className="post-hero">
          <Image
            src={post.imageUrl}
            alt={post.imageAlt}
            width={800} height={400}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            unoptimized
          />
        </div>
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        {related.length > 0 && (
          <>
            <hr className="post-divider" style={{ marginTop: '3rem' }} />
            <div className="section-label">More Stories</div>
            <div className="related-grid">
              {related.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
