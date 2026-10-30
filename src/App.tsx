import { Route, Routes } from 'react-router-dom'
import Layout, { WithSidebar } from './components/Layout'
import Home from './pages/Home'
import PostPage from './pages/PostPage'
import Categories from './pages/Categories'
import Tags from './pages/Tags'
import Taxonomy from './pages/Taxonomy'
import About from './pages/About'
import NotFound from './pages/NotFound'
import Chat from './pages/Chat'
import AdminLayout from './pages/admin/AdminLayout'
import AdminPosts from './pages/admin/AdminPosts'
import PostEditor from './pages/admin/PostEditor'
import TermAdmin from './pages/admin/TermAdmin'
import AdminUsers from './pages/admin/AdminUsers'
import AdminHr from './pages/admin/AdminHr'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<WithSidebar />}>
          <Route index element={<Home />} />
          <Route path="post/:slug" element={<PostPage />} />
          <Route path="categories" element={<Categories />} />
          <Route path="category/:slug" element={<Taxonomy kind="category" />} />
          <Route path="tags" element={<Tags />} />
          <Route path="tag/:slug" element={<Taxonomy kind="tag" />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="chat" element={<Chat />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminPosts />} />
          <Route path="posts/new" element={<PostEditor />} />
          <Route path="posts/:slug/edit" element={<PostEditor />} />
          <Route path="categories" element={<TermAdmin kind="category" />} />
          <Route path="tags" element={<TermAdmin kind="tag" />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="hr" element={<AdminHr />} />
        </Route>
      </Route>
    </Routes>
  )
}
