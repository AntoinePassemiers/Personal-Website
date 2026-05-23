---
layout: ../../../layouts/PostLayout.astro
title: Code examples in a static blog
description: A minimal technical article showing inline code, highlighted blocks, and notebook-style static output.
date: 2026-05-22
lang: en
tag: Machine Learning
---

This article is written in Markdown, but rendered by Astro into static HTML that GitHub Pages can host.

Inline code such as `const answer = 42` works naturally, and fenced code blocks are syntax-highlighted at build time.

```ts
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

console.log(greet('GitHub Pages'));
```

You can also include static notebook-style outputs. They are not executed by GitHub Pages; they are just rendered content.

```python
values = [2, 3, 5, 8, 13]
sum(values) / len(values)
```

```text
6.2
```

For real notebook publishing, replace or extend this skeleton with Quarto, MDX components, or a build step that converts notebooks to Markdown/HTML before Astro builds the site.

## Why this fixes duplication

The navbar and page shell are not repeated in this post. This file only contains content and frontmatter. Astro injects it into `PostLayout.astro`, which itself uses `BaseLayout.astro`, `Navbar.astro`, and `Footer.astro`.
