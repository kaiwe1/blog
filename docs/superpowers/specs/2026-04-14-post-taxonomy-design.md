# Post Taxonomy Design

## Goal

Extend post metadata to support series and tags, then expose that data on the home page, post page, `/series`, `/series/[series]`, `/tags`, and `/tags/[tag]`.

The design keeps authoring simple:

- Authors write human-readable tag names in MDX frontmatter
- Authors write series as `{ name, order }`
- The app derives stable URL slugs in code

## Current State

The blog currently reads all content from `content/posts/*.mdx` through `lib/posts.ts`.

Each post exposes:

- `slug`
- `title`
- `date`
- `excerpt`
- `content`

The home page and post page both read directly from `lib/posts.ts`, so taxonomy should be added there rather than computed independently in pages.

## Frontmatter Format

Posts may optionally define:

```yaml
---
title: "Hello, World!"
date: "April 4, 2026"
excerpt: "Welcome to my new blog built with Next.js SSG and MDX."
series:
  name: "Blog Basics"
  order: 1
tags:
  - "Next.js"
  - "MDX"
---
```

Rules:

- `series` is optional
- `tags` is optional
- `series.name` is required when `series` exists
- `series.order` is required when `series` exists
- Tags are stored as an array of display names in frontmatter

## Runtime Data Model

`lib/posts.ts` will normalize frontmatter into these shapes:

```ts
interface PostSeries {
  name: string
  slug: string
  order: number
}

interface PostTag {
  name: string
  slug: string
}

interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  series?: PostSeries
  tags: PostTag[]
}
```

The file will also expose aggregate helpers:

- `getAllPosts()`
- `getPostBySlug(slug)`
- `getAllSeries()`
- `getPostsBySeriesSlug(seriesSlug)`
- `getSeriesBySlug(seriesSlug)`
- `getAllTags()`
- `getPostsByTagSlug(tagSlug)`
- `getTagBySlug(tagSlug)`

Aggregate entries should include enough information to render listing pages without recomputing counts or names in page components.

## Slug Generation

Series and tag URLs should be generated from display names in code.

Normalization rules:

- Lowercase
- Trim outer whitespace
- Convert internal runs of spaces and punctuation to `-`
- Collapse repeated `-`
- Remove leading and trailing `-`

Examples:

- `Next.js` -> `next-js`
- `Frontend System Design` -> `frontend-system-design`
- `C++` -> `c`

This rule applies consistently to both series and tags.

## Sorting Rules

Posts:

- Site-wide post lists stay sorted by date descending

Series page:

- Posts in a series are sorted by `series.order` ascending
- If two posts share the same order, break ties by date ascending, then slug ascending for deterministic output

Tags page:

- Tag list is sorted by post count descending
- If counts tie, sort by tag name ascending

Series index page:

- Series list is sorted alphabetically by series name ascending

## Page Behavior

### Home Page

Each post card shows:

- title
- date
- excerpt
- series metadata when present
- tags when present

Series should link to `/series/[series]`.
Tags should link to `/tags/[tag]`.

Recommended display:

- `Series: Blog Basics · Part 1`
- tag chips or inline text links for tags

### Post Page

The post header shows the same taxonomy metadata as the home page.

If the post belongs to a series, the page also renders a "This series" section:

- all posts in the same series
- sorted by `series.order`
- current post visually distinguished
- each sibling post links to its post page

### `/series`

Lists all series.

Each series entry shows:

- series name
- total post count
- link to `/series/[series]`

Optional preview metadata may be included if already convenient from aggregation, but it is not required for the first implementation.

### `/series/[series]`

Shows:

- series name
- total post count
- posts in the series sorted by `series.order`

Each post item shows at minimum:

- part number
- title
- date
- excerpt

### `/tags`

Lists all tags.

Each tag entry shows:

- tag name
- total post count
- link to `/tags/[tag]`

### `/tags/[tag]`

Shows:

- tag name
- total post count
- all posts with that tag, sorted by date descending

Each post item shows at minimum:

- title
- date
- excerpt
- optional series metadata when present

## Routing and Static Generation

The four new pages are statically generated:

- `app/series/page.tsx`
- `app/series/[series]/page.tsx`
- `app/tags/page.tsx`
- `app/tags/[tag]/page.tsx`

Dynamic taxonomy routes should use `generateStaticParams()` based on normalized slugs from `lib/posts.ts`.

Unknown taxonomy slugs should resolve with `notFound()`.

## Error Handling

For this iteration:

- Missing `series` or `tags` should be treated as empty metadata, not an error
- Invalid `series` objects should be normalized defensively where possible
- If a taxonomy page is requested for a slug that does not exist, return 404

The implementation should avoid throwing on older posts that do not yet define taxonomy metadata.

## Testing Strategy

Implementation should follow TDD.

Priority coverage:

1. `lib/posts.ts` parsing and normalization for `series` and `tags`
2. slug generation behavior for natural-language names
3. aggregate helpers for series and tag indexes
4. sorting rules for series posts and tag listings
5. page rendering for home page, post page, and the four new taxonomy routes

Tests should prefer the existing test stack if present. If no test stack exists, add the smallest practical setup that can cover the content helpers and key page behavior.

## Non-Goals

This design does not include:

- nested taxonomies
- tag descriptions
- series descriptions
- pagination
- previous/next navigation
- schema migrations for old content beyond optional metadata support

## Implementation Notes

Keep taxonomy logic centralized in `lib/posts.ts` so page components remain presentation-focused.

Shared UI fragments for rendering series and tags may be extracted if duplication between home and post pages becomes noticeable during implementation, but this is optional and should stay lightweight for the current project size.
