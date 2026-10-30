---
title: 7 TypeScript Tips for Cleaner Code
date: 2026-10-12
author: Murat İlk
category: Web Development
tags: typescript, javascript, best-practices
excerpt: Small TypeScript habits that make a big difference in large codebases.
---
TypeScript can do a lot more than add `: string` to your variables.

## 1. Prefer `unknown` over `any`
`unknown` forces you to narrow before use, which catches bugs early.

## 2. Use `satisfies`
It validates a value against a type without widening it.

## 3. Discriminated unions
Model states explicitly: `{ status: 'loading' } | { status: 'done', data: T }`.

…and four more you'll discover by reading the handbook!
