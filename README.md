# Blog

Kaiwei Zhang's blog built by Next.js SSG App Router.

## Development

Node

Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building

Build the project for production:
```bash
pnpm build
```

## Testing

Run the test suite:
```bash
pnpm test
```

## Content Management

Posts are stored in the `content/posts/` directory as `.mdx` files.

Each post should have frontmatter with the following fields:
- `title`: Post title
- `date`: Publication date (YYYY-MM-DD)
- `excerpt`: Short description
- `series` (optional): Object with `name` and `order`
- `tags` (optional): Array of tag strings

Example frontmatter:
```yaml
---
title: "Hello World"
date: "2026-04-16"
excerpt: "My first blog post"
tags: ["introduction", "welcome"]
---
```

## Project Structure

- `app/`: Next.js app router pages
- `components/`: Reusable React components
- `content/posts/`: MDX blog posts
- `lib/`: Utility functions for post processing
- `tests/`: Test files
- `types/`: TypeScript type definitions

## Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint
- `pnpm test`: Run tests