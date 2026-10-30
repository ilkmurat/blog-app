import { Link } from 'react-router-dom'
import { formatDate, slugify, type Post } from '../lib/posts'

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card">
      <div className="meta">
        <Link to={`/category/${slugify(post.category)}`} className="category-badge">{post.category}</Link>
        <span>{formatDate(post.date)}</span>
        <span>· {post.readingTime} min read</span>
      </div>
      <h2><Link to={`/post/${post.slug}`}>{post.title}</Link></h2>
      <p className="excerpt">{post.excerpt}</p>
      <div className="tag-row">
        {post.tags.map((t) => (
          <Link key={t} to={`/tag/${slugify(t)}`} className="tag">#{t}</Link>
        ))}
      </div>
    </article>
  )
}
