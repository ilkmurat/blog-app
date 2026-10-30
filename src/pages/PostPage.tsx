import Markdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { formatDate, getPost, posts, slugify } from '../lib/posts'
import NotFound from './NotFound'

export default function PostPage() {
  const { slug = '' } = useParams()
  const post = getPost(slug)
  if (!post) return <NotFound />

  const related = posts
    .filter((p) => p.slug !== post.slug && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, 2)

  return (
    <>
      <article className="post">
        <Link to="/" className="back">← All posts</Link>
        <div className="meta">
          <Link to={`/category/${slugify(post.category)}`} className="category-badge">{post.category}</Link>
          <span>{formatDate(post.date)}</span>
          <span>· {post.readingTime} min read</span>
        </div>
        <h1>{post.title}</h1>
        <p className="author">By {post.author}</p>
        <div className="prose">
          <Markdown>{post.content}</Markdown>
        </div>
        <div className="tag-row">
          {post.tags.map((t) => (
            <Link key={t} to={`/tag/${slugify(t)}`} className="tag">#{t}</Link>
          ))}
        </div>
      </article>
      {related.length > 0 && (
        <section className="related">
          <h2>Related posts</h2>
          {related.map((p) => <PostCard key={p.slug} post={p} />)}
        </section>
      )}
    </>
  )
}
