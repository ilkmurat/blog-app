---
title: Deploying a Vite App to GitHub Pages
date: 2026-08-10
author: Murat İlk
category: DevOps
tags: github, deployment, vite
excerpt: Ship your static site for free with GitHub Actions and GitHub Pages.
---
GitHub Pages is a great free host for static sites.

## Steps
1. Set `base: './'` in `vite.config.ts`
2. Add a GitHub Actions workflow that runs `npm run build`
3. Upload `dist/` with `actions/upload-pages-artifact` and deploy with `actions/deploy-pages`

That's exactly how this blog is deployed!
