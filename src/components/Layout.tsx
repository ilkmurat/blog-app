import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import AuthModal, { type AuthMode } from './AuthModal'
import Sidebar from './Sidebar'

const year = new Date().getFullYear()

export function WithSidebar() {
  return (
    <div className="main-grid">
      <div className="content">
        <Outlet />
      </div>
      <Sidebar />
    </div>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const [modal, setModal] = useState<AuthMode | null>(null)
  useEffect(() => {
    // Braces matter: newer browsers return a Promise from scrollTo, which React would treat as a cleanup.
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo">Inkwell</Link>
          <nav className="nav">
            <NavLink to="/" end>Blog</NavLink>
            <NavLink to="/categories">Categories</NavLink>
            <NavLink to="/tags">Tags</NavLink>
            <NavLink to="/chat">Chat</NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>
          <div className="account">
            {user ? (
              <>
                <span className="hello">Hi, {user.first_name || user.username}</span>
                {user.is_admin && <Link to="/admin" className="button">Admin</Link>}
                <button className="button" onClick={logout}>Log out</button>
              </>
            ) : (
              <>
                <button className="link-button" onClick={() => setModal('login')}>Log in</button>
                <button className="button primary" onClick={() => setModal('signup')}>Sign up</button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="container page">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">© {year} Inkwell Blog · Built with React & Vite</div>
      </footer>
      {modal && <AuthModal mode={modal} onModeChange={setModal} onClose={() => setModal(null)} />}
    </>
  )
}
