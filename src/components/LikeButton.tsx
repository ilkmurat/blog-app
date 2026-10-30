import { useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Post } from '../lib/types'

/** Anyone can like; anonymous likes are unlimited, members count once per post. */
export default function LikeButton({ post }: { post: Post }) {
  const { user } = useAuth()
  const [count, setCount] = useState(post.like_count)
  const [liked, setLiked] = useState(post.liked_by_me)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  const memberLiked = user !== null && liked

  async function like() {
    setBusy(true)
    setError(undefined)
    try {
      const result = await api.likePost(post.slug)
      setCount(result.like_count)
      setLiked(result.liked_by_me)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="like">
      <button
        className={`like-button${memberLiked ? ' liked' : ''}`}
        onClick={like}
        disabled={busy || memberLiked}
        aria-pressed={memberLiked}
        title={memberLiked ? 'You liked this post' : 'Like this post'}
      >
        <span aria-hidden="true">{memberLiked ? '♥' : '♡'}</span> {memberLiked ? 'Liked' : 'Like'}
        <span className="like-count">{count}</span>
      </button>
      {error && <span className="error">{error}</span>}
    </div>
  )
}
