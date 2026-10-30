export default function About() {
  return (
    <article className="post prose">
      <h1>About</h1>
      <p>
        Inkwell is a blog built with React, TypeScript and Vite on the frontend, and a FastAPI backend that stores
        posts in PostgreSQL and indexes them in Qdrant for semantic search.
      </p>
      <p>Each post has a category and any number of tags, which you can browse from the menu or sidebar.</p>
    </article>
  )
}
