import { useState } from 'react'
import Markdown from 'react-markdown'
import { Link, useNavigate, useParams } from 'react-router-dom'
import LikeButton from '../components/LikeButton'
import PostCard from '../components/PostCard'
import Status from '../components/Status'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { formatDate } from '../lib/format'
import { useApi } from '../lib/hooks'
import type { Post } from '../lib/types'

function Related({ post }: { post: Post }) {
  const state = useApi(() => api.searchPosts(`${post.title} ${post.excerpt}`, 3), [post.slug])
  const related = state.data?.filter((h) => h.post.slug !== post.slug).slice(0, 2) ?? []
  if (related.length === 0) return null
  return (
    <section className="related">
      <h2>Related posts</h2>
      {related.map((h) => <PostCard key={h.post.slug} post={h.post} />)}
    </section>
  )
}

export default function PostPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { user, ready } = useAuth()
  // Refetch when the user changes so `liked_by_me` matches who is logged in.
  const state = useApi(() => (ready ? api.getPost(slug) : new Promise<never>(() => {})), [slug, ready, user?.id])
  const [deleteError, setDeleteError] = useState<string>()

  async function remove() {
    if (!confirm('Delete this post? This cannot be undone.')) return
    try {
      await api.deletePost(slug)
      navigate('/')
    } catch (e) {
      setDeleteError((e as Error).message)
    }
  }

  return (
    <Status state={state}>
      {(post) => (
        <>
          <article className="post">
            <div className="post-toolbar">
              <Link to="/" className="back">← All posts</Link>
              {user?.is_admin && (
                <div className="actions">
                  <Link to={`/admin/posts/${post.slug}/edit`} className="button">Edit</Link>
                  <button className="button danger" onClick={remove}>Delete</button>
                </div>
              )}
            </div>
            {deleteError && <p className="error">{deleteError}</p>}
            <div className="meta">
              <Link to={`/category/${post.category.slug}`} className="category-badge">{post.category.name}</Link>
              <span>{formatDate(post.published_at)}</span>
              <span>· {post.reading_time} min read</span>
            </div>
            <h1>{post.title}</h1>
            <p className="author">By {post.author}</p>
            <div className="prose">
              <Markdown>{post.content}</Markdown>
            </div>
            <div className="post-footer">
              {/* Remount on fresh data so local like state never outlives a refetch. */}
              <LikeButton key={`${post.slug}-${post.like_count}-${post.liked_by_me}`} post={post} />
              <div className="tag-row">
                {post.tags.map((t) => (
                  <Link key={t.slug} to={`/tag/${t.slug}`} className="tag">#{t.name}</Link>
                ))}
              </div>
            </div>
          </article>
          <Related post={post} />
        </>
      )}
    </Status>
  )
}
