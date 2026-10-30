# Inkwell Blog

Blog frontend built with React, TypeScript, Vite and React Router. Content comes from the
[Inkwell Blog API](https://github.com/ilkmurat/blog-api) (FastAPI + PostgreSQL + Qdrant); the `/chat` assistant is
[Inkwell Blog Agent](https://github.com/ilkmurat/blog-agent) (LangChain + Ollama + MCP).

## Features
- Post list with server-side pagination and keyword search
- **Semantic search** (toggle next to the search box), powered by Qdrant
- Post pages rendered from Markdown, with semantically related posts
- Categories and tags (index pages + filtered post lists), sidebar with counts and recent posts
- Like button: anyone can like; anonymous likes are unlimited, members like a post once
- Sign up / log in modal (first name, last name, email, username, password)
- **Chat assistant at `/chat`** (public): ask about posts, categories, likes and stats in Turkish or English;
  streamed answers with tool progress; admins can also ask about users
- Admin panel at **`/admin`** (default login `murat` / `murat`): manage posts, create categories, tags and users
- Responsive layout with automatic dark mode

## Run everything with Docker
Clone [blog-api](https://github.com/ilkmurat/blog-api) and [blog-agent](https://github.com/ilkmurat/blog-agent)
next to this repo, start Ollama on the host (`ollama serve`, model `qwen2.5:14b`), then:

```bash
docker compose up -d --build                     # web + api + postgres + qdrant
docker compose exec api python -m app.seed        # optional sample posts
```

| Service | URL |
|---|---|
| Blog | http://localhost:3000 |
| Chat | http://localhost:3000/chat |
| API docs | http://localhost:8000/docs |

nginx serves the built app and proxies `/api` to the backend and `/agent` to the chat agent, so no CORS setup is needed.

## Local development (hot reload)
```bash
cd ../blog-api && docker compose up -d   # backend only
npm install && npm run dev               # http://localhost:5173, /api proxied to localhost:8000
```

## Configuration
| Variable | When | Default |
|---|---|---|
| `VITE_API_URL` | build time; absolute API URL when the API is on another origin | same origin |
| `VITE_BASE` | build time; base path the app is served from (GitHub Pages sets `/<repo>/`) | `/` |
| `API_PROXY_TARGET` | `npm run dev` proxy target | `http://localhost:8000` |

## GitHub Pages
The workflow in `.github/workflows/deploy.yml` builds and deploys on push to `main`. Because the site now reads
from the API, set a repository variable `VITE_API_URL` to your publicly hosted API and add the Pages origin to the
API's `CORS_ORIGINS`.
