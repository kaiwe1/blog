import fs from 'fs'
import path from 'path'
import { createInterface } from 'readline'

const postsDir = path.resolve(process.cwd(), 'content/posts')

function parseArgs(args) {
  const title = args.find((a) => !a.startsWith('--'))
  const excerptIdx = args.indexOf('--excerpt')
  const tagsIdx = args.indexOf('--tags')
  const seriesIdx = args.indexOf('--series')
  const orderIdx = args.indexOf('--order')
  return {
    title: title || '',
    excerpt: excerptIdx > -1 ? args[excerptIdx + 1] || '' : null,
    tags: tagsIdx > -1 ? args[tagsIdx + 1] || '' : null,
    series: seriesIdx > -1 ? args[seriesIdx + 1] || '' : null,
    order: orderIdx > -1 ? args[orderIdx + 1] || '' : null,
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function prompt(rl, q) {
  return new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())))
}

function formatDate() {
  const now = new Date()
  const month = now.toLocaleString('en-US', { month: 'long' })
  return `${month} ${now.getDate()}, ${now.getFullYear()}`
}

function buildFrontmatter({ title, excerpt, tags, series, order }) {
  const lines = ['---', `title: "${title}"`, `date: "${formatDate()}"`]

  if (excerpt) lines.push(`excerpt: "${excerpt}"`)

  if (series) {
    lines.push('series:')
    lines.push(`  name: "${series}"`)
    lines.push(`  order: ${Number(order) || 1}`)
  }

  if (tags) {
    const tagList = tags
      .split(',')
      .map((t) => `  - "${t.trim()}"`)
      .filter((t) => t !== '  - ""')
    if (tagList.length > 0) {
      lines.push('tags:')
      lines.push(...tagList)
    }
  }

  lines.push('---', '', '')
  return lines.join('\n')
}

async function main() {
  const { title, excerpt: cliExcerpt, tags: cliTags, series: cliSeries, order: cliOrder } = parseArgs(process.argv.slice(2))

  let resolvedTitle = title
  let resolvedExcerpt = cliExcerpt
  let resolvedTags = cliTags
  let resolvedSeries = cliSeries
  let resolvedOrder = cliOrder

  if (!title || cliExcerpt === null || cliTags === null || cliSeries === null) {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    resolvedTitle = resolvedTitle || (await prompt(rl, 'Title: '))
    if (!resolvedTitle) {
      console.error('Title is required.')
      rl.close()
      process.exit(1)
    }

    if (resolvedExcerpt === null) resolvedExcerpt = await prompt(rl, 'Excerpt: ')
    if (resolvedTags === null) resolvedTags = await prompt(rl, 'Tags (comma-separated): ')
    if (resolvedSeries === null) {
      resolvedSeries = await prompt(rl, 'Series (optional): ')
      if (resolvedSeries) {
        resolvedOrder = await prompt(rl, '  Series order: ') || '1'
      }
    }
    rl.close()
  }

  const slug = slugify(resolvedTitle)
  const filePath = path.join(postsDir, `${slug}.mdx`)

  if (fs.existsSync(filePath)) {
    console.error(`"${slug}.mdx" already exists.`)
    process.exit(1)
  }

  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true })
  }

  await fs.promises.writeFile(
    filePath,
    buildFrontmatter({ title: resolvedTitle, excerpt: resolvedExcerpt, tags: resolvedTags, series: resolvedSeries, order: resolvedOrder })
  )

  console.log(`\nCreated: content/posts/${slug}.mdx`)
}

main()
