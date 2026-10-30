# Inkwell Blog

Frontend of the **Inkwell** blog platform and the entry point for running the whole system: a React blog with
likes, sign-up, an AI chat assistant (blog + HR questions) and an admin panel.

| Repo | Role |
|---|---|
| **blog-app** (this) | React frontend, nginx, full-stack `docker-compose.yml` |
| [blog-api](https://github.com/ilkmurat/blog-api) | FastAPI REST API + MCP server, PostgreSQL, Qdrant, embeddings |
| [blog-agent](https://github.com/ilkmurat/blog-agent) | LangChain chat agent on Ollama (`qwen3:14b`), Langfuse tracing |

```
Browser ──► web (nginx :3000) ─┬─ /            React app (static build)
                               ├─ /api/        ─► blog-api :8000 ─► PostgreSQL, Qdrant
                               └─ /agent/      ─► blog-agent :8001 ─► Ollama (host, qwen3:14b)
                                                        │          └─► Langfuse :3001 (optional)
                                                        └─ MCP ─► blog-api /mcp/
```

## Screens
| Screen | URL | Who | What |
|---|---|---|---|
| Blog (home) | `/` | everyone | post list with pagination, keyword search and a **Semantic** search toggle |
| Post | `/post/:slug` | everyone | Markdown post, **Like** button, tags, semantically related posts; Edit/Delete for admins |
| Categories / Tags | `/categories`, `/tags` | everyone | all categories / tags with post counts |
| Category / Tag page | `/category/:slug`, `/tag/:slug` | everyone | posts filtered by category or tag |
| About | `/about` | everyone | |
| **Chat** | `/chat` | everyone | AI assistant: blog questions for all; **HR questions for logged-in users**; user details for admins |
| Sign up / Log in | modal from the header | everyone | first name, last name, email, username, password (username + email unique, no other validation) |
| **Admin panel** | `/admin` | admins (login form if not logged in) | tabs below |
| Admin › Posts | `/admin` | admin | list, edit, delete; **+ New post** (`/admin/posts/new`, `/admin/posts/:slug/edit`) with category select and tag picker |
| Admin › Categories | `/admin/categories` | admin | create categories |
| Admin › Tags | `/admin/tags` | admin | create tags |
| Admin › Users | `/admin/users` | admin | list users, add users (optionally as admin) |
| Admin › HR Documents | `/admin/hr` | admin | upload Turkish/any-language PDFs (title, topic), watch processing → ready, delete |

Default admin login: **murat / murat** (configured in blog-api; change it before deploying publicly).

**Likes:** visitors can like a post any number of times; logged-in members can like each post once.

## Chat assistant (`/chat`)
- Answers stream token by token; tool calls are shown ("Searching HR documents", "Finding the most liked posts", …).
- Model: **Ollama `qwen3:14b`** running on the host (thinking mode off). Turkish and English.
- Blog questions use the blog-api MCP tools (posts by category, most liked, semantic search, stats).
- **HR questions** ("Yıllık iznim kaç gün?") are answered only for logged-in users, only from uploaded HR PDFs,
  citing document and page. Visitors are asked to log in.
- Admins can also ask about users. Every conversation is traced in Langfuse when configured.

## AI models
| Purpose | Model | Where |
|---|---|---|
| Chat / tool calling | `qwen3:14b` via Ollama | host machine (`ollama pull qwen3:14b`) |
| Blog semantic search | [BAAI/bge-small-en-v1.5](https://huggingface.co/BAAI/bge-small-en-v1.5) (ONNX: [Qdrant/bge-small-en-v1.5-onnx-Q](https://huggingface.co/Qdrant/bge-small-en-v1.5-onnx-Q)) | blog-api (fastembed) |
| HR document RAG (Turkish) | [intfloat/multilingual-e5-large](https://huggingface.co/intfloat/multilingual-e5-large) (ONNX: [Qdrant/multilingual-e5-large-onnx](https://huggingface.co/Qdrant/multilingual-e5-large-onnx)) | blog-api (fastembed) |

## Data stores
- **PostgreSQL** (`localhost:5432`, db/user/password `blog`): posts, categories, tags, users, sessions, likes,
  HR document metadata. Open with DBeaver.
- **Qdrant** (`localhost:6333`): collections `posts` and `hr_chunks`. Dashboard: http://localhost:6333/dashboard.
- Full table/collection reference: [blog-api README](https://github.com/ilkmurat/blog-api#database-postgresql).

## Run everything (Docker)
Prerequisites: Docker Desktop, [Ollama](https://ollama.com) on the host, and the three repos side by side:

```
projects/
  blog-app/    ← run compose here
  blog-api/
  blog-agent/
```

```bash
ollama serve &                 # if not already running (keep it running)
ollama pull qwen3:14b          # once, ~9 GB
cd blog-app
docker compose up -d --build   # web, api, agent, postgres, qdrant
docker compose exec api python -m app.seed      # optional sample posts
```
The first start downloads the embedding models (~2.3 GB) — chat HR answers work once blog-api logs "HR embedding model ready".

| URL | |
|---|---|
| http://localhost:3000 | blog |
| http://localhost:3000/chat | chat assistant |
| http://localhost:3000/admin | admin panel |
| http://localhost:8000/docs | API docs (Swagger) |
| http://localhost:6333/dashboard | Qdrant dashboard |
| http://localhost:3001 | Langfuse (optional, see blog-agent) |

## Local development (hot reload)
```bash
cd ../blog-app && docker compose up -d api agent   # backend services
npm install && npm run dev                          # http://localhost:5173; /api and /agent proxied
```

## Tech stack
React 19, TypeScript 7, Vite 8, React Router 7 (`BrowserRouter`), react-markdown; oxlint; nginx 1.27 (Docker).
No UI framework — styles in `src/index.css` with CSS variables and automatic dark mode.

## Configuration
| Variable | When | Default |
|---|---|---|
| `VITE_API_URL` | build: API on another origin | same origin |
| `VITE_BASE` | build: base path (GitHub Pages sets `/<repo>/`) | `/` |
| `API_PROXY_TARGET` / `AGENT_PROXY_TARGET` | `npm run dev` proxies | `http://localhost:8000` / `:8001` |

## Project layout
```
src/
  main.tsx, App.tsx          router + routes
  components/                Layout (header, auth buttons), Sidebar, PostCard/PostList, LikeButton, AuthModal, Status
  pages/                     Home, PostPage, Categories, Tags, Taxonomy, About, Chat, NotFound
  pages/admin/               AdminLayout (guard + tabs), AdminPosts, PostEditor, TermAdmin, AdminUsers, AdminHr
  lib/api.ts                 REST client (bearer token), lib/chat.ts SSE client, lib/auth.tsx auth context
  lib/hooks.ts, types.ts, format.ts
nginx.conf                   static app + /api and /agent proxies (25 MB uploads, SSE without buffering)
docker-compose.yml           includes ../blog-api and ../blog-agent compose files
```

## GitHub Pages
`.github/workflows/deploy.yml` builds on push to `main`. Pages only hosts static files: enable Pages (Source:
GitHub Actions), host the API/agent elsewhere and set the repository variable `VITE_API_URL`.
