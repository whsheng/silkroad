const fs = require("node:fs")
const path = require("node:path")

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function normalizeLineEndings(value) {
  return String(value ?? "").replace(/\r\n/g, "\n")
}

function parseFrontmatter(markdown) {
  const normalized = normalizeLineEndings(markdown)

  if (!normalized.startsWith("---\n")) {
    return {
      frontmatter: {},
      body: normalized.trim()
    }
  }

  const endIndex = normalized.indexOf("\n---\n", 4)

  if (endIndex < 0) {
    return {
      frontmatter: {},
      body: normalized.trim()
    }
  }

  const frontmatterSource = normalized.slice(4, endIndex)
  const body = normalized.slice(endIndex + 5).trim()
  const frontmatter = {}

  frontmatterSource.split("\n").forEach((line) => {
    const separatorIndex = line.indexOf(":")

    if (separatorIndex < 0) {
      return
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()

    if (!key) {
      return
    }

    frontmatter[key] = value
  })

  return {
    frontmatter,
    body
  }
}

function toParagraphBlocks(paragraphs) {
  return paragraphs
    .map((paragraph) => String(paragraph ?? "").trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: "paragraph",
      content: paragraph
    }))
}

function parseMarkdownBlocks(markdownBody) {
  const lines = normalizeLineEndings(markdownBody).split("\n")
  const blocks = []
  let index = 0

  function isBlank(line) {
    return line.trim().length === 0
  }

  function isBullet(line) {
    return /^-\s+/.test(line.trim())
  }

  function isNumbered(line) {
    return /^\d+\.\s+/.test(line.trim())
  }

  function isHeading(line) {
    return /^#{2,3}\s+/.test(line.trim())
  }

  function isQuote(line) {
    return /^>\s?/.test(line.trim())
  }

  function collectWhile(predicate) {
    const collected = []

    while (index < lines.length && predicate(lines[index])) {
      collected.push(lines[index])
      index += 1
    }

    return collected
  }

  while (index < lines.length) {
    if (isBlank(lines[index])) {
      index += 1
      continue
    }

    const currentLine = lines[index].trim()

    if (isHeading(currentLine)) {
      const level = currentLine.startsWith("### ") ? 3 : 2

      blocks.push({
        type: "heading",
        level,
        content: currentLine.replace(/^#{2,3}\s+/, "").trim()
      })
      index += 1
      continue
    }

    if (isBullet(currentLine)) {
      const bulletLines = collectWhile((line) => isBullet(line))
      blocks.push({
        type: "bulletList",
        items: bulletLines.map((line) => line.trim().replace(/^-+\s+/, ""))
      })
      continue
    }

    if (isNumbered(currentLine)) {
      const numberedLines = collectWhile((line) => isNumbered(line))
      blocks.push({
        type: "numberedList",
        items: numberedLines.map((line) => line.trim().replace(/^\d+\.\s+/, ""))
      })
      continue
    }

    if (isQuote(currentLine)) {
      const quoteLines = collectWhile((line) => isQuote(line))
      blocks.push({
        type: "blockquote",
        content: quoteLines.map((line) => line.trim().replace(/^>\s?/, "")).join(" ")
      })
      continue
    }

    const paragraphLines = collectWhile((line) => {
      const trimmed = line.trim()

      return Boolean(trimmed) && !isHeading(trimmed) && !isBullet(trimmed) && !isNumbered(trimmed) && !isQuote(trimmed)
    })

    blocks.push({
      type: "paragraph",
      content: paragraphLines.map((line) => line.trim()).join(" ")
    })
  }

  return blocks
}

function normalizeLegacyGuideRecord(record) {
  const translations = Object.fromEntries(
    Object.entries(record.translations ?? {}).map(([locale, translation]) => [
      locale,
      {
        ...translation,
        content: toParagraphBlocks(translation.content ?? [])
      }
    ])
  )

  return {
    ...record,
    status: "published",
    translations
  }
}

function parseDirectoryGuideRecord(directoryPath, options) {
  const metaPath = path.join(directoryPath, "meta.json")

  if (!fs.existsSync(metaPath)) {
    return null
  }

  const meta = readJsonFile(metaPath)
  const translations = {}

  options.locales.forEach((locale) => {
    const markdownPath = path.join(directoryPath, `${locale}.md`)

    if (!fs.existsSync(markdownPath)) {
      return
    }

    const markdown = fs.readFileSync(markdownPath, "utf8")
    const { frontmatter, body } = parseFrontmatter(markdown)

    translations[locale] = {
      title: String(frontmatter.title ?? "").trim(),
      summary: String(frontmatter.summary ?? "").trim(),
      seoTitle: String(frontmatter.seoTitle ?? "").trim(),
      seoDescription: String(frontmatter.seoDescription ?? "").trim(),
      content: parseMarkdownBlocks(body)
    }
  })

  return {
    id: meta.id,
    slug: meta.slug,
    sortOrder: meta.sortOrder,
    status: meta.status ?? "published",
    featuredCategorySlugs: meta.featuredCategorySlugs ?? [],
    featuredMarketSlugs: meta.featuredMarketSlugs ?? [],
    featuredPlatformSlugs: meta.featuredPlatformSlugs ?? [],
    publishedAt: meta.publishedAt,
    updatedAt: meta.updatedAt,
    translations
  }
}

function loadGuideRecordsFromContent(contentRoot, options) {
  const guidesRoot = path.join(contentRoot, "guides")
  const legacyGuidesPath = path.join(guidesRoot, "index.json")
  const legacyGuides = fs.existsSync(legacyGuidesPath) ? readJsonFile(legacyGuidesPath).map(normalizeLegacyGuideRecord) : []
  const mergedGuideMap = new Map()
  const directorySlugSet = new Set()

  legacyGuides.forEach((guide) => {
    if (options.includeDrafts || guide.status === "published") {
      mergedGuideMap.set(guide.slug, guide)
    }
  })

  fs.readdirSync(guidesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .forEach((entry) => {
      const directoryGuide = parseDirectoryGuideRecord(path.join(guidesRoot, entry.name), options)

      if (!directoryGuide) {
        return
      }

      if (directorySlugSet.has(directoryGuide.slug)) {
        throw new Error(`guides: duplicate directory slug ${directoryGuide.slug}`)
      }

      directorySlugSet.add(directoryGuide.slug)

      if (options.includeDrafts || directoryGuide.status === "published") {
        mergedGuideMap.set(directoryGuide.slug, directoryGuide)
      }
    })

  return [...mergedGuideMap.values()]
}

module.exports = {
  loadGuideRecordsFromContent
}
