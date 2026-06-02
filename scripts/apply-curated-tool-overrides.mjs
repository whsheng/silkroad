import fs from "node:fs"
import path from "node:path"

import { curatedToolOverrides } from "./curated-tool-overrides-data.mjs"

const repoRoot = process.cwd()
const contentRoot = path.join(repoRoot, "content")
const reviewedAt = "2026-06-02"

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(contentRoot, relativePath), "utf8"))
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(contentRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

function normalizeDomainFromUrl(url) {
  return new URL(url).hostname.replace(/^www\./i, "").toLowerCase()
}

function mergeTranslations(existingTranslations, overrideTranslations) {
  if (!overrideTranslations) {
    return existingTranslations
  }

  return {
    ...existingTranslations,
    ...Object.fromEntries(
      Object.entries(overrideTranslations).map(([locale, translation]) => [
        locale,
        {
          ...existingTranslations?.[locale],
          ...translation
        }
      ])
    )
  }
}

function applyOverride(tool, override) {
  const officialUrl = override.officialUrl ?? tool.officialUrl
  const normalizedDomain = override.normalizedDomain ?? normalizeDomainFromUrl(officialUrl)

  return {
    ...tool,
    ...override,
    officialUrl,
    normalizedDomain,
    verificationStatus: "reviewed",
    sourceType: "manual_editor",
    publicationStatus: override.publicationStatus ?? "published",
    reviewStatus: "published",
    reviewedAt,
    translations: mergeTranslations(tool.translations, override.translations)
  }
}

function applyStatusRule(tool) {
  if (tool.slug === "拓海申诉" || tool.slug === "河南威旭国际物流有限公司") {
    return {
      ...tool,
      publicationStatus: "rejected",
      reviewStatus: "rejected",
      auditStatus: "review_needed"
    }
  }

  return tool
}

function rebuildCategoryToolSlugs(categories, tools) {
  const publishedToolSlugsByCategory = new Map(categories.map((category) => [category.slug, []]))

  tools.forEach((tool) => {
    tool.categorySlugs.forEach((categorySlug) => {
      const list = publishedToolSlugsByCategory.get(categorySlug)

      if (list) {
        list.push(tool.slug)
      }
    })
  })

  return categories.map((category) => ({
    ...category,
    toolSlugs: Array.from(
      new Set([
        ...category.toolSlugs.filter((slug) => tools.some((tool) => tool.slug === slug)),
        ...(publishedToolSlugsByCategory.get(category.slug) ?? [])
      ])
    )
  }))
}

function main() {
  const tools = readJson("tools/index.json")
  const categories = readJson("categories/index.json")
  const overrideMap = new Map(curatedToolOverrides.map((item) => [item.slug, item]))

  const updatedTools = tools.map((tool) => {
    const override = overrideMap.get(tool.slug)
    return applyStatusRule(override ? applyOverride(tool, override) : tool)
  })

  const updatedCategories = rebuildCategoryToolSlugs(categories, updatedTools)

  writeJson("tools/index.json", updatedTools)
  writeJson("categories/index.json", updatedCategories)

  const appliedCount = curatedToolOverrides.filter((item) => tools.some((tool) => tool.slug === item.slug)).length
  console.log(`Applied curated overrides to ${appliedCount} tools on ${reviewedAt}.`)
}

main()
