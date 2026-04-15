# Blog

My personal blog built with Next.js, featuring MDX-powered posts with support for series and tags.

## Features

- **MDX Support**: Write posts in Markdown with JSX components
- **Series**: Group related posts into series with custom ordering
- **Tags**: Categorize posts with tags
- **Syntax Highlighting**: Code blocks with syntax highlighting using Highlight.js
- **Responsive Design**: Styled with Tailwind CSS
- **TypeScript**: Fully typed for better development experience
- **Testing**: Unit tests with Vitest and Testing Library

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Content**: MDX with next-mdx-remote
- **Testing**: Vitest, @testing-library/react
- **Linting**: ESLint (via Next.js)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kaiwe1/blog.git
   cd blog
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Development

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
- `docs/`: Documentation and planning files
- `lib/`: Utility functions for post processing
- `tests/`: Test files
- `types/`: TypeScript type definitions

## Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint
- `pnpm test`: Run tests