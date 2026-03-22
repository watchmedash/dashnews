"use client"
import { useState } from 'react'
import PostCard from '@/components/PostCard'
import { Post } from '@/lib/posts'

const POSTS_PER_PAGE = 6

export default function HomeClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts] = useState<Post[]>(initialPosts)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('All')
  const [page, setPage] = useState(1)

  const allTags = ['All', ...Array.from(new Set(posts.map(p => p.tag)))]

  const filtered = posts.filter(p => {
    const matchTag = activeTag === 'All' || p.tag === activeTag
    const q = search.toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
    return matchTag && matchSearch
  })

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE)
  const pagePosts = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  function changePage(n: number) {
    setPage(n)
    document.getElementById('posts-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const featured = posts[0]
  const featuredSide = posts.slice(1, 3)

  return (
    <main>
      <div className="hero">
        <h1>⚡ DashNews</h1>
      </div>

      <div className="container">

      {posts.length === 0 ? (
<div className="empty-state">
  <div className="icon">📰</div>
  <p>No stories yet.</p>
  <button
    onClick={async () => {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: 'Generate breaking news story',
            model: 'llama-3.1-8b-instant'
          })
        })
        if (res.ok) {
          window.location.reload()
        } else {
          alert('Failed to generate story')
        }
      } catch {
        alert('Generate failed')
      }
    }}
    className="generate-btn"
    style={{
      background: 'var(--accent)',
      color: 'white',
      border: 'none',
      padding: '1rem 2rem',
      borderRadius: '8px',
      fontSize: '1rem',
      cursor: 'pointer',
      marginTop: '1rem'
    }}
  >
First Story!
  </button>
</div>
) : (
          <>
            {featured && (
              <>
                <div className="section-label">Latest Story</div>
                <div className="featured-grid">
                  <PostCard post={featured} large />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {featuredSide.map(p => <PostCard key={p.id} post={p} />)}
                  </div>
                </div>
              </>
            )}

            <div id="posts-section">
              <div className="section-label">All Stories</div>
              <div className="search-wrap">
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
              <div className="tags-filter">
                {allTags.map(t => (
                  <button
                    key={t}
                    className={`tag-btn${activeTag === t ? ' active' : ''}`}
                    onClick={() => { setActiveTag(t); setPage(1) }}
                  >{t}</button>
                ))}
              </div>

              {pagePosts.length === 0 ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '3rem 0' }}>
                  No stories match your search.
                </p>
              ) : (
                <div className="posts-grid">
                  {pagePosts.map(p => <PostCard key={p.id} post={p} />)}
                </div>
              )}

              {totalPages > 1 && (
                <div className="pagination">
                  <button className="pag-btn" onClick={() => changePage(page - 1)} disabled={page === 1}>← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n} className={`pag-btn${n === page ? ' active' : ''}`} onClick={() => changePage(n)}>{n}</button>
                  ))}
                  <button className="pag-btn" onClick={() => changePage(page + 1)} disabled={page === totalPages}>Next →</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
