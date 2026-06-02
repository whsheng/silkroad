import fs from "node:fs"
import path from "node:path"

const repoRoot = process.cwd()
const contentRoot = path.join(repoRoot, "content")
const issueFlag = "--issue-file"
const applyFlag = "--apply"

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(contentRoot, relativePath), "utf8"))
}

function writeJson(relativePath, value) {
  const filePath = path.join(contentRoot, relativePath)
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function getArgValue(flag) {
  const index = process.argv.indexOf(flag)
  return index >= 0 ? process.argv[index + 1] : undefined
}

function hasFlag(flag) {
  return process.argv.includes(flag)
}

function sanitizeInline(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
}

function sanitizeMultiline(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .trim()
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function normalizeWebsiteUrl(value) {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`

  try {
    const url = new URL(candidate)

    if (!["http:", "https:"].includes(url.protocol)) {
      return null
    }

    const normalizedDomain = url.hostname.replace(/^www\./i, "").toLowerCase()
    const normalizedPath = url.pathname.replace(/\/+$/g, "")
    const siteUrl = normalizedPath || url.search ? `${url.protocol}//${normalizedDomain}${normalizedPath}${url.search}` : `${url.protocol}//${normalizedDomain}`

    return {
      siteUrl,
      normalizedDomain
    }
  } catch {
    return null
  }
}

function parseListSection(body, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const pattern = new RegExp(`## ${escapedHeading}\\n([\\s\\S]*?)(?=\\n## |$)`)
  const match = body.match(pattern)

  if (!match) {
    return []
  }

  return match[1]
    .split("\n")
    .map((line) => {
      const slugMatch = line.match(/\(`([^`]+)`\)/)
      return slugMatch ? slugMatch[1].trim() : ""
    })
    .filter(Boolean)
}

function parseSingleLineField(linePrefix, body) {
  const line = body
    .split("\n")
    .find((item) => item.startsWith(`${linePrefix}:`))

  return line ? sanitizeInline(line.slice(line.indexOf(":") + 1)) : ""
}

function parseIssueBody(rawBody) {
  const body = sanitizeMultiline(rawBody)
  const descriptionMatch = body.match(/## Description\n([\s\S]*?)(?=\n## |$)/)
  const notesMatch = body.match(/## Notes\n([\s\S]*?)(?=\n## |$)/)
  const localeMatch = parseSingleLineField("- Locale", body).match(/\(([^)]+)\)/)
  const issueTitleMatch = body.match(/^\[Submission\]\[([^\]]+)\]\s+(.+)$/m)

  const locale = localeMatch?.[1] ?? "zh-CN"
  const siteName = parseSingleLineField("- Site name", body) || issueTitleMatch?.[2] || ""
  const siteUrl = parseSingleLineField("- Site URL", body)
  const domain = parseSingleLineField("- Domain", body)
  const contact = parseSingleLineField("- Contact", body)
  const [contactName, contactDetails] = contact.split("/").map((value) => sanitizeInline(value))

  return {
    locale,
    siteName,
    siteUrl,
    domain,
    description: descriptionMatch ? sanitizeMultiline(descriptionMatch[1]) : "",
    notes: notesMatch ? sanitizeMultiline(notesMatch[1]) : "",
    categorySlugs: parseListSection(body, "Suggested Categories"),
    marketSlugs: parseListSection(body, "Suggested Markets"),
    platformSlugs: parseListSection(body, "Suggested Platforms"),
    contactName,
    contactDetails
  }
}

function uniqueSlug(baseSlug, existingSlugs) {
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug
  }

  let counter = 2
  while (existingSlugs.has(`${baseSlug}-${counter}`)) {
    counter += 1
  }

  return `${baseSlug}-${counter}`
}

function titleFromSlug(slug, locale, categories) {
  const categoryName =
    categories.find((item) => item.slug === slug)?.translation?.name ??
    slug

  if (locale === "zh-CN") {
    return `${categoryName} 相关场景`
  }

  return `${categoryName} workflows`
}

function buildToolRecord(parsedIssue, options) {
  const normalizedUrl = normalizeWebsiteUrl(parsedIssue.siteUrl)
  assert(normalizedUrl, "Issue body contains an invalid or missing Site URL")

  assert(parsedIssue.siteName.length >= 2, "Issue body is missing a valid Site name")
  assert(parsedIssue.description.length >= 20, "Issue body is missing a sufficiently detailed Description")
  assert(parsedIssue.categorySlugs.length > 0, "Issue body must include at least one category")
  assert(parsedIssue.marketSlugs.length > 0, "Issue body must include at least one market")
  assert(parsedIssue.platformSlugs.length > 0, "Issue body must include at least one platform")

  const sourceIssueNumber = options.issueNumber
  const normalizedDomain = normalizedUrl.normalizedDomain
  const baseSlug = slugify(parsedIssue.siteName || normalizedDomain || "submitted-tool")
  const slug = uniqueSlug(baseSlug, options.existingToolSlugs)
  const name = sanitizeInline(parsedIssue.siteName)
  const zhSummary = sanitizeInline(parsedIssue.description.slice(0, 120))
  const enSummary = `Useful resource for China-based global commerce teams: ${name}`

  return {
    id: `tool-${slug}`,
    slug,
    nameDefault: name,
    officialUrl: normalizedUrl.siteUrl,
    normalizedDomain,
    pricingModel: "custom",
    supportsChinese: true,
    verificationStatus: "reviewed",
    sourceType: "manual_editor",
    publicationStatus: "published",
    auditStatus: "review_needed",
    sourceIssueNumber,
    reviewStatus: "approved",
    reviewedAt: new Date().toISOString().slice(0, 10),
    categorySlugs: parsedIssue.categorySlugs,
    marketSlugs: parsedIssue.marketSlugs,
    platformSlugs: parsedIssue.platformSlugs,
    isFeatured: false,
    score: 40,
    translations: {
      "zh-CN": {
        locale: "zh-CN",
        name,
        summary: zhSummary,
        description: `${sanitizeMultiline(parsedIssue.description)}${parsedIssue.notes ? `\n\n补充说明：${parsedIssue.notes}` : ""}`,
        bestFor: titleFromSlug(parsedIssue.categorySlugs[0], "zh-CN", options.categories),
        notFor: "如果你需要非常细的价格对比或深度测评，仍建议结合官网与人工评估。",
        pricingNotes: "价格与套餐请以官网或商务沟通结果为准。",
        seoTitle: `${name} 是什么？适合哪些出海团队使用 | Silkroads Trade`,
        seoDescription: zhSummary
      },
      en: {
        locale: "en",
        name,
        summary: enSummary,
        description: `${sanitizeMultiline(parsedIssue.description)}${parsedIssue.notes ? `\n\nAdditional notes: ${parsedIssue.notes}` : ""}`,
        bestFor: titleFromSlug(parsedIssue.categorySlugs[0], "en", options.categories),
        notFor: "Teams that need audited pricing comparisons should still confirm details directly with the provider.",
        pricingNotes: "Confirm pricing and package details directly with the provider.",
        seoTitle: `${name} for China-based global commerce teams | Silkroads Trade`,
        seoDescription: `${name} is a submitted resource under editorial review for China-based global commerce workflows.`
      }
    }
  }
}

function updateCategoriesWithTool(categories, toolSlug, categorySlugs) {
  return categories.map((category) => {
    if (!categorySlugs.includes(category.slug) || category.toolSlugs.includes(toolSlug)) {
      return category
    }

    return {
      ...category,
      toolSlugs: [toolSlug, ...category.toolSlugs]
    }
  })
}

function main() {
  const issueFile = getArgValue(issueFlag)
  assert(issueFile, `Usage: node scripts/generate-tool-from-issue.mjs ${issueFlag} <path> [${applyFlag}] [--issue-number 123]`)

  const issueNumberArg = getArgValue("--issue-number")
  const issueNumber = issueNumberArg ? Number(issueNumberArg) : null
  assert(issueNumberArg === undefined || Number.isInteger(issueNumber), "If provided, --issue-number must be an integer")

  const issueBody = fs.readFileSync(path.resolve(repoRoot, issueFile), "utf8")
  const categories = readJson("categories/index.json")
  const categoryTranslations = readJson("categories/translations/zh-CN.json")
  const tools = readJson("tools/index.json")
  const parsedIssue = parseIssueBody(issueBody)
  const existingToolSlugs = new Set(tools.map((tool) => tool.slug))
  const existingDomains = new Set(tools.map((tool) => tool.normalizedDomain))

  const normalizedUrl = normalizeWebsiteUrl(parsedIssue.siteUrl)
  assert(normalizedUrl, "Issue body contains an invalid Site URL")
  assert(!existingDomains.has(normalizedUrl.normalizedDomain), `Tool domain already exists: ${normalizedUrl.normalizedDomain}`)

  const categorySlugSet = new Set(categories.map((category) => category.slug))
  parsedIssue.categorySlugs.forEach((slug) => assert(categorySlugSet.has(slug), `Unknown category slug: ${slug}`))

  const enrichedCategories = categories.map((category) => ({
    ...category,
    translation: categoryTranslations[category.slug]
  }))

  const toolRecord = buildToolRecord(parsedIssue, {
    categories: enrichedCategories,
    existingToolSlugs,
    issueNumber
  })

  const updatedCategories = updateCategoriesWithTool(categories, toolRecord.slug, toolRecord.categorySlugs)

  if (hasFlag(applyFlag)) {
    writeJson("tools/index.json", [toolRecord, ...tools])
    writeJson("categories/index.json", updatedCategories)
  }

  console.log(
    JSON.stringify(
      {
        mode: hasFlag(applyFlag) ? "applied" : "preview",
        issueNumber,
        tool: toolRecord,
        categoryUpdates: updatedCategories
          .filter((category, index) => category.toolSlugs.length !== categories[index].toolSlugs.length)
          .map((category) => ({
            slug: category.slug,
            addedToolSlug: toolRecord.slug
          }))
      },
      null,
      2
    )
  )
}

main()
