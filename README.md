# Inkwell Blog

A blog frontend built with React, TypeScript, Vite and React Router.

## Features
- Post list with search and pagination
- Post detail pages rendered from Markdown, with related posts
- Categories and tags (index pages + filtered post lists)
- Sidebar with categories, tag cloud and recent posts
- Responsive layout with automatic dark mode
- Automatic deployment to GitHub Pages via GitHub Actions

## Development
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Writing a post
Add a Markdown file to `src/posts/` (the filename becomes the URL slug):

```markdown
---
title: My New Post
date: 2026-11-01
author: Your Name
category: Web Development
tags: react, tips
excerpt: Optional short summary.
---
Post content in **Markdown**.
```

## Deployment
Every push to `main` builds and deploys the site to GitHub Pages
(Settings → Pages → Source: **GitHub Actions**).
