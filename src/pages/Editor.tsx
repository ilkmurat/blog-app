import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Status from '../components/Status'
import { api } from '../lib/api'
import { useApi } from '../lib/hooks'
import type { Post, PostInput } from '../lib/types'

interface FormValues {
  title: string
  slug: string
  author: string
  category: string
  tags: string
  excerpt: string
  published: string
  content: string
}

const toForm = (post?: Post): FormValues => ({
  title: post?.title ?? '',
  slug: post?.slug ?? '',
  author: post?.author ?? '',
  category: post?.category.name ?? '',
  tags: post?.tags.map((t) => t.name).join(', ') ?? '',
  excerpt: post?.excerpt ?? '',
  published: (post?.published_at ?? new Date().toISOString()).slice(0, 10),
  content: post?.content ?? '',
})

function toInput(v: FormValues): PostInput {
  return {
    title: v.title,
    slug: v.slug || undefined,
    author: v.author || undefined,
    category: v.category,
    tags: v.tags.split(',').map((t) => t.trim()).filter(Boolean),
    excerpt: v.excerpt || undefined,
    published_at: new Date(`${v.published}T00:00:00Z`).toISOString(),
    content: v.content,
  }
}

function EditorForm({ post }: { post?: Post }) {
  const navigate = useNavigate()
  const categories = useApi(api.categories, [])
  const [values, setValues] = useState(() => toForm(post))
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const field = (name: keyof FormValues) => ({
    value: values[name],
    onChange: (e: { target: { value: string } }) => setValues({ ...values, [name]: e.target.value }),
  })

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(undefined)
    try {
      const saved = post ? await api.updatePost(post.slug, toInput(values)) : await api.createPost(toInput(values))
      navigate(`/post/${saved.slug}`)
    } catch (err) {
      setError((err as Error).message)
      setSaving(false)
    }
  }

  return (
    <form className="editor" onSubmit={submit}>
      <h1 className="page-title">{post ? 'Edit post' : 'New post'}</h1>
      {error && <p className="error">{error}</p>}
      <label>Title<input required maxLength={200} {...field('title')} /></label>
      <div className="row">
        <label>
          Slug <small>(optional, from title)</small>
          <input pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="my-post" {...field('slug')} />
        </label>
        <label>Published<input type="date" required {...field('published')} /></label>
      </div>
      <div className="row">
        <label>
          Category
          <input required list="category-options" {...field('category')} />
          <datalist id="category-options">
            {categories.data?.map((c) => <option key={c.slug} value={c.name} />)}
          </datalist>
        </label>
        <label>Author<input placeholder="Anonymous" {...field('author')} /></label>
      </div>
      <label>Tags <small>(comma separated)</small><input placeholder="react, tips" {...field('tags')} /></label>
      <label>Excerpt <small>(optional)</small><textarea rows={2} maxLength={500} {...field('excerpt')} /></label>
      <label>Content <small>(Markdown)</small><textarea required rows={16} className="mono" {...field('content')} /></label>
      <div className="actions">
        <button type="submit" className="button primary" disabled={saving}>{saving ? 'Saving…' : post ? 'Save changes' : 'Publish'}</button>
        <Link to={post ? `/post/${post.slug}` : '/'} className="button">Cancel</Link>
      </div>
    </form>
  )
}

function EditExisting({ slug }: { slug: string }) {
  const state = useApi(() => api.getPost(slug), [slug])
  return <Status state={state}>{(post) => <EditorForm post={post} />}</Status>
}

export default function Editor() {
  const { slug } = useParams()
  return slug ? <EditExisting key={slug} slug={slug} /> : <EditorForm />
}
