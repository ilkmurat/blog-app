import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

const year = new Date().getFullYear()

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo">Inkwell</Link>
          <nav className="nav">
            <NavLink to="/" end>Blog</NavLink>
            <NavLink to="/categories">Categories</NavLink>
            <NavLink to="/tags">Tags</NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>
        </div>
      </header>
      <main className="container main-grid">
        <div className="content">
          <Outlet />
        </div>
        <Sidebar />
      </main>
      <footer className="site-footer">
        <div className="container">© {year} Inkwell Blog · Built with React & Vite</div>
      </footer>
    </>
  )
}
