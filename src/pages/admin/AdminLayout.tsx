import { useState, type FormEvent } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../lib/auth'

function AdminLogin() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(undefined)
    try {
      const user = await login(username, password)
      if (!user.is_admin) setError('This account is not an admin.')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <form className="form admin-login" onSubmit={submit}>
      <h1 className="page-title">Admin login</h1>
      {error && <p className="error">{error}</p>}
      <label>Username<input required autoFocus autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} /></label>
      <label>Password<input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      <button type="submit" className="button primary block">Log in</button>
    </form>
  )
}

export default function AdminLayout() {
  const { user, ready, logout } = useAuth()

  if (!ready) return <p className="loading">Loading…</p>
  if (!user) return <AdminLogin />
  if (!user.is_admin)
    return (
      <div className="admin-login">
        <h1 className="page-title">Admin</h1>
        <p className="error">You're logged in as {user.username}, which is not an admin account.</p>
        <button className="button" onClick={logout}>Log out</button>
      </div>
    )

  return (
    <div className="admin">
      <div className="admin-header">
        <h1 className="page-title">Admin panel</h1>
        <nav className="tabs">
          <NavLink to="/admin" end>Posts</NavLink>
          <NavLink to="/admin/categories">Categories</NavLink>
          <NavLink to="/admin/tags">Tags</NavLink>
          <NavLink to="/admin/users">Users</NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  )
}
