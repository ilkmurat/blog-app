---
title: Modern Layouts with CSS Grid
date: 2026-09-28
author: Murat İlk
category: Design
tags: css, layout, responsive
excerpt: Build responsive layouts without media-query soup using CSS Grid.
---
CSS Grid lets you describe layouts in two dimensions.

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
```

This single rule creates a responsive card grid — no breakpoints required.
