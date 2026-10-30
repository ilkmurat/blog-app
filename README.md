# Inkwell Blog

Blog frontend built with React, TypeScript, Vite and React Router. Content comes from the
[Inkwell Blog API](../blog-api) (FastAPI + PostgreSQL + Qdrant).

## Features
- Post list with server-side pagination and keyword search
- **Semantic search** (toggle next to the search box), powered by Qdrant
- Post pages rendered from Markdown, with semantically related posts
- Categories and tags (index pages + filtered post lists), sidebar with counts and recent posts
- Editor to create, edit and delete posts (`+ Write`)
- Responsive layout with automatic dark mode

## Run everything with Docker
Clone the backend next to this repo (`../blog-api`), then:

```bash
docker compose up -d --build                     # web + api + postgres + qdrant
docker compose exec api python -m app.seed        # optional sample posts
```

| Service | URL |
|---|---|
| Blog | http://localhost:3000 |
| API docs | http://localhost:8000/docs |

nginx serves the built app and proxies `/api` to the backend, so no CORS setup is needed.

## Local development (hot reload)
```bash
cd ../blog-api && docker compose up -d   # backend only
npm install && npm run dev               # http://localhost:5173, /api proxied to localhost:8000
```

## Configuration
| Variable | When | Default |
|---|---|---|
| `VITE_API_URL` | build time; absolute API URL when the API is on another origin | same origin |
| `API_PROXY_TARGET` | `npm run dev` proxy target | `http://localhost:8000` |

## GitHub Pages
The workflow in `.github/workflows/deploy.yml` builds and deploys on push to `main`. Because the site now reads
from the API, set a repository variable `VITE_API_URL` to your publicly hosted API and add the Pages origin to the
API's `CORS_ORIGINS`.
