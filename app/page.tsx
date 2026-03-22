import { getAllPosts } from '@/lib/posts'
import HomeClient from '@/components/HomeClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const posts = getAllPosts()
  const latest = posts[0]
  const image = latest?.imageUrl ?? 'https://dashnews.top/og-default.jpg'
  const title = latest ? `${latest.title} — DashNews` : 'DashNews — Breaking News & Stories'
  const description = latest?.excerpt ?? 'The latest breaking news and stories from around the world.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: 'https://dashnews.top',
      siteName: 'DashNews',
      images: [{ url: image, width: 1200, height: 630, alt: latest?.title ?? 'DashNews' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default function Home() {
  const posts = getAllPosts()
  return <HomeClient initialPosts={posts} />
}
