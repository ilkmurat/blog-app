---
title: Getting Started with React in 2026
date: 2026-10-20
author: Murat İlk
category: Web Development
tags: react, javascript, beginners
excerpt: A practical introduction to building your first React app with Vite and TypeScript.
---
React is still one of the most popular ways to build user interfaces. In this post we'll set up a project from scratch.

## Create the project

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app && npm install && npm run dev
```

## Components are just functions

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>
}
```

> Start small, compose often.

That's all you need to get going. Next time we'll look at routing.
