import { Link } from 'react-router-dom'
import { formatDate } from '../lib/format'
import type { PostSummary } from '../lib/types'

export default function PostCard({ post, score }: { post: PostSummary; score?: number }) {
  return (
    <article className="post-card">
      <div className="meta">
        <Link to={`/category/${post.category.slug}`} className="category-badge">{post.category.name}</Link>
        <span>{formatDate(post.published_at)}</span>
        <span>· {post.reading_time} min read</span>
        <span className="likes" title="Likes">· ♥ {post.like_count}</span>
        {score !== undefined && <span className="score">· {Math.round(score * 100)}% match</span>}
      </div>
      <h2><Link to={`/post/${post.slug}`}>{post.title}</Link></h2>
      <p className="excerpt">{post.excerpt}</p>
      <div className="tag-row">
        {post.tags.map((t) => (
          <Link key={t.slug} to={`/tag/${t.slug}`} className="tag">#{t.name}</Link>
        ))}
      </div>
    </article>
  )
}
