import { useState } from 'react'
import PostCard from '../components/PostCard'
import PostList from '../components/PostList'
import Status from '../components/Status'
import { api } from '../lib/api'
import { useApi, useDebounced } from '../lib/hooks'

type Mode = 'keyword' | 'semantic'

function SemanticResults({ query }: { query: string }) {
  const state = useApi(() => api.searchPosts(query), [query])
  return (
    <Status state={state}>
      {(hits) =>
        hits.length === 0 ? (
          <p className="empty">No posts found.</p>
        ) : (
          <div className="post-list">
            {hits.map((h) => <PostCard key={h.post.slug} post={h.post} score={h.score} />)}
          </div>
        )
      }
    </Status>
  )
}

export default function Home() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('keyword')
  const query = useDebounced(input.trim())

  return (
    <>
      <section className="hero">
        <h1>Stories, guides & ideas</h1>
        <p>Thoughts on web development, design, and productivity.</p>
        <div className="search-row">
          <input
            className="search"
            type="search"
            placeholder={mode === 'semantic' ? 'Describe what you are looking for…' : 'Search posts…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="toggle" role="group" aria-label="Search mode">
            <button className={mode === 'keyword' ? 'active' : ''} onClick={() => setMode('keyword')}>Keyword</button>
            <button className={mode === 'semantic' ? 'active' : ''} onClick={() => setMode('semantic')}>Semantic</button>
          </div>
        </div>
      </section>
      {mode === 'semantic' && query ? <SemanticResults query={query} /> : <PostList key={query} filters={{ q: query }} />}
    </>
  )
}
