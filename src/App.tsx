import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import PostPage from './pages/PostPage'
import Categories from './pages/Categories'
import Tags from './pages/Tags'
import Taxonomy from './pages/Taxonomy'
import About from './pages/About'
import Editor from './pages/Editor'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="new" element={<Editor />} />
        <Route path="post/:slug" element={<PostPage />} />
        <Route path="post/:slug/edit" element={<Editor />} />
        <Route path="categories" element={<Categories />} />
        <Route path="category/:slug" element={<Taxonomy kind="category" />} />
        <Route path="tags" element={<Tags />} />
        <Route path="tag/:slug" element={<Taxonomy kind="tag" />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
