import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { savePost, Post } from '@/lib/posts'
import { randomUUID } from 'crypto'

const TAGS = ['World', 'Technology', 'Science', 'Politics', 'Health', 'Business', 'Entertainment', 'Sports']

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)
}

async function getUnsplashImage(query: string): Promise<{ url: string; alt: string }> {
  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
    )
    if (!res.ok) throw new Error('Unsplash failed')
    const data = await res.json()
    return { url: data.urls.regular, alt: data.alt_description ?? query }
  } catch {
    return { url: `https://picsum.photos/seed/${Date.now()}/800/400`, alt: query }
  }
}

export async function GET(request: Request) {
  const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  })
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const tag = TAGS[Math.floor(Math.random() * TAGS.length)]

  const completion = await openai.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You are a fake news writer. Write stories that sound completely realistic and believable — like real breaking news from a real outlet like BBC or Reuters.
The stories should be fictional but plausible: realistic people, realistic events, realistic locations, realistic quotes from named experts or officials.
No jokes, no absurdity, no animals doing human things. Just convincing fake news that could fool someone skimming a headline.
Respond ONLY with valid JSON — no markdown, no code blocks, no extra text.`
      },
      {
        role: 'user',
        content: `Write a fake news story in the "${tag}" category.
Return this exact JSON structure:
{
  "title": "catchy fake headline, max 12 words",
  "excerpt": "2-sentence funny teaser, max 40 words",
  "content": "full article as HTML using <p>, <h2>, <blockquote> tags. At least 3 paragraphs, min 200 words.",
  "author": "funny fake reporter name",
  "imageQuery": "2-3 word Unsplash search query related to the story"
}`
      }
    ],
    temperature: 0.8,
    max_tokens: 1000,
  })

  const raw = completion.choices[0].message.content ?? '{}'

  let parsed: { title: string; excerpt: string; content: string; author: string; imageQuery: string }
  try {
    let cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end !== -1) cleaned = cleaned.slice(start, end + 1)
    parsed = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: 'GPT returned invalid JSON', raw }, { status: 500 })
  }

  const { url, alt } = await getUnsplashImage(parsed.imageQuery ?? tag)

  const wordCount = parsed.content.replace(/<[^>]+>/g, '').split(/\s+/).length
  const readTime = `${Math.max(1, Math.round(wordCount / 200))} min read`

  const post: Post = {
    id: toSlug(parsed.title) + '-' + randomUUID().slice(0, 6),
    title: parsed.title,
    excerpt: parsed.excerpt,
    content: parsed.content,
    tag,
    author: parsed.author,
    readTime,
    imageUrl: url,
    imageAlt: alt,
    createdAt: new Date().toISOString(),
  }

  savePost(post)
  return NextResponse.json({ success: true, post })
}
