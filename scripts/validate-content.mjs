import fs from "node:fs"
import path from "node:path"
import guideContentUtils from "../lib/content/guides-shared.js"
import * as toolContentUtils from "../lib/content/tools-shared.mjs"

const repoRoot = process.cwd()
const contentRoot = path.join(repoRoot, "content")
const locales = ["zh-CN", "en"]
const defaultLocale = "zh-CN"
const adScheduleTimeZone = "Asia/Shanghai"

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(contentRoot, relativePath), "utf8"))
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function validateTranslations(translations, entityName) {
  locales.forEach((locale) => {
    assert(translations[locale], `${entityName}: missing translation for ${locale}`)
  })
}

function validateGuideTranslations(translations, entityName) {
  assert(translations["zh-CN"], `${entityName}: missing translation for zh-CN`)

  Object.entries(translations).forEach(([locale, translation]) => {
    assert(locales.includes(locale), `${entityName}: invalid locale ${locale}`)
    assert(typeof translation.title === "string" && translation.title.length > 0, `${entityName}: missing title for ${locale}`)
    assert(typeof translation.summary === "string" && translation.summary.length > 0, `${entityName}: missing summary for ${locale}`)
    assert(typeof translation.seoTitle === "string" && translation.seoTitle.length > 0, `${entityName}: missing seoTitle for ${locale}`)
    assert(
      typeof translation.seoDescription === "string" && translation.seoDescription.length > 0,
      `${entityName}: missing seoDescription for ${locale}`
    )
    assert(Array.isArray(translation.content) && translation.content.length > 0, `${entityName}: empty content for ${locale}`)

    translation.content.forEach((block, index) => {
      assert(typeof block.type === "string", `${entityName}: missing block type for ${locale}#${index}`)

      if (block.type === "heading") {
        assert([2, 3].includes(block.level), `${entityName}: invalid heading level for ${locale}#${index}`)
        assert(typeof block.content === "string" && block.content.length > 0, `${entityName}: empty heading for ${locale}#${index}`)
        return
      }

      if (block.type === "bulletList" || block.type === "numberedList") {
        assert(Array.isArray(block.items) && block.items.length > 0, `${entityName}: empty list for ${locale}#${index}`)
        return
      }

      assert(["paragraph", "blockquote"].includes(block.type), `${entityName}: invalid block type ${block.type} for ${locale}#${index}`)
      assert(typeof block.content === "string" && block.content.length > 0, `${entityName}: empty text block for ${locale}#${index}`)
    })
  })
}

function getCurrentDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: adScheduleTimeZone
  }).format(new Date())
}

function main() {
  const categories = readJson("categories/index.json")
  const categoryZh = readJson("categories/translations/zh-CN.json")
  const categoryEn = readJson("categories/translations/en.json")
  const markets = readJson("markets/index.json")
  const marketZh = readJson("markets/translations/zh-CN.json")
  const marketEn = readJson("markets/translations/en.json")
  const platforms = readJson("platforms/index.json")
  const platformZh = readJson("platforms/translations/zh-CN.json")
  const platformEn = readJson("platforms/translations/en.json")
  const guides = guideContentUtils.loadGuideRecordsFromContent(contentRoot, {
    defaultLocale,
    locales,
    includeDrafts: true
  })
  const tools = readJson("tools/index.json").map((tool) => toolContentUtils.normalizeToolRecord(tool))
  const ads = readJson("ads/items.json")
  const placements = readJson("ads/placements.json")

  assert(Array.isArray(categories) && categories.length > 0, "categories: expected non-empty array")
  assert(Array.isArray(markets) && markets.length > 0, "markets: expected non-empty array")
  assert(Array.isArray(platforms) && platforms.length > 0, "platforms: expected non-empty array")
  assert(Array.isArray(guides) && guides.length > 0, "guides: expected non-empty array")
  assert(Array.isArray(tools) && tools.length > 0, "tools: expected non-empty array")
  assert(Array.isArray(placements) && placements.length > 0, "ads/placements: expected non-empty array")

  const categorySlugSet = new Set(categories.map((category) => category.slug))
  const marketSlugSet = new Set(markets.map((market) => market.slug))
  const platformSlugSet = new Set(platforms.map((platform) => platform.slug))
  const placementKeySet = new Set(placements.map((placement) => placement.key))
  const toolSlugSet = new Set()
  const placementCountMap = new Map()
  const adIdSet = new Set()
  const currentDateKey = getCurrentDateKey()

  placements.forEach((placement) => {
    assert(typeof placement.key === "string" && placement.key.length > 0, "placement: missing key")
    assert(Number.isInteger(placement.maxItems) && placement.maxItems > 0, `placement ${placement.key}: invalid maxItems`)
  })

  categories.forEach((category) => {
    assert(typeof category.slug === "string" && category.slug.length > 0, "category: missing slug")
    assert(Array.isArray(category.toolSlugs), `category ${category.slug}: toolSlugs must be an array`)
    assert(categoryZh[category.slug], `category ${category.slug}: missing zh-CN translation`)
    assert(categoryEn[category.slug], `category ${category.slug}: missing en translation`)
  })

  markets.forEach((market) => {
    assert(marketZh[market.slug], `market ${market.slug}: missing zh-CN translation`)
    assert(marketEn[market.slug], `market ${market.slug}: missing en translation`)
  })

  platforms.forEach((platform) => {
    assert(platformZh[platform.slug], `platform ${platform.slug}: missing zh-CN translation`)
    assert(platformEn[platform.slug], `platform ${platform.slug}: missing en translation`)
  })

  tools.forEach((tool) => {
    assert(!toolSlugSet.has(tool.slug), `tools: duplicate slug ${tool.slug}`)
    toolSlugSet.add(tool.slug)
    assert(typeof tool.officialUrl === "string" && tool.officialUrl.startsWith("http"), `tool ${tool.slug}: invalid officialUrl`)
    assert(typeof tool.normalizedDomain === "string" && tool.normalizedDomain.length > 0, `tool ${tool.slug}: missing normalizedDomain`)
    assert(Array.isArray(tool.categorySlugs) && tool.categorySlugs.length > 0, `tool ${tool.slug}: missing categorySlugs`)
    assert(Array.isArray(tool.marketSlugs) && tool.marketSlugs.length > 0, `tool ${tool.slug}: missing marketSlugs`)
    assert(Array.isArray(tool.platformSlugs) && tool.platformSlugs.length > 0, `tool ${tool.slug}: missing platformSlugs`)
    assert(toolContentUtils.toolPublicationStatuses.includes(tool.publicationStatus), `tool ${tool.slug}: invalid publicationStatus`)
    assert(toolContentUtils.toolAuditStatuses.includes(tool.auditStatus), `tool ${tool.slug}: invalid auditStatus`)
    if (tool.lastCheckedAt !== undefined) {
      assert(/^\d{4}-\d{2}-\d{2}$/.test(tool.lastCheckedAt), `tool ${tool.slug}: invalid lastCheckedAt`)
    }
    if (tool.finalUrl !== undefined) {
      assert(typeof tool.finalUrl === "string" && tool.finalUrl.startsWith("http"), `tool ${tool.slug}: invalid finalUrl`)
    }
    if (tool.finalDomain !== undefined) {
      assert(typeof tool.finalDomain === "string" && tool.finalDomain.length > 0, `tool ${tool.slug}: invalid finalDomain`)
    }
    if (tool.pageTitle !== undefined) {
      assert(typeof tool.pageTitle === "string", `tool ${tool.slug}: invalid pageTitle`)
    }
    if (tool.sourceIssueNumber !== undefined) {
      assert(Number.isInteger(tool.sourceIssueNumber) && tool.sourceIssueNumber > 0, `tool ${tool.slug}: invalid sourceIssueNumber`)
    }
    if (tool.reviewStatus !== undefined) {
      assert(
        ["pending-review", "needs-info", "approved", "rejected", "published"].includes(tool.reviewStatus),
        `tool ${tool.slug}: invalid reviewStatus`
      )
    }
    if (tool.reviewedAt !== undefined) {
      assert(/^\d{4}-\d{2}-\d{2}$/.test(tool.reviewedAt), `tool ${tool.slug}: invalid reviewedAt`)
    }
    validateTranslations(tool.translations, `tool ${tool.slug}`)
    tool.categorySlugs.forEach((slug) => assert(categorySlugSet.has(slug), `tool ${tool.slug}: unknown category ${slug}`))
    tool.marketSlugs.forEach((slug) => assert(marketSlugSet.has(slug), `tool ${tool.slug}: unknown market ${slug}`))
    tool.platformSlugs.forEach((slug) => assert(platformSlugSet.has(slug), `tool ${tool.slug}: unknown platform ${slug}`))
  })

  categories.forEach((category) => {
    category.toolSlugs.forEach((slug) => assert(toolSlugSet.has(slug), `category ${category.slug}: unknown tool slug ${slug}`))
    category.marketSlugs.forEach((slug) => assert(marketSlugSet.has(slug), `category ${category.slug}: unknown market ${slug}`))
    category.platformSlugs.forEach((slug) => assert(platformSlugSet.has(slug), `category ${category.slug}: unknown platform ${slug}`))
  })

  guides.forEach((guide) => {
    assert(typeof guide.id === "string" && guide.id.length > 0, "guide: missing id")
    assert(typeof guide.slug === "string" && guide.slug.length > 0, "guide: missing slug")
    assert(Number.isInteger(guide.sortOrder), `guide ${guide.slug}: invalid sortOrder`)
    assert(["published", "draft"].includes(guide.status ?? "published"), `guide ${guide.slug}: invalid status`)
    assert(/^\d{4}-\d{2}-\d{2}$/.test(guide.publishedAt), `guide ${guide.slug}: invalid publishedAt`)
    assert(/^\d{4}-\d{2}-\d{2}$/.test(guide.updatedAt), `guide ${guide.slug}: invalid updatedAt`)
    guide.featuredCategorySlugs.forEach((slug) => assert(categorySlugSet.has(slug), `guide ${guide.slug}: unknown category ${slug}`))
    guide.featuredMarketSlugs.forEach((slug) => assert(marketSlugSet.has(slug), `guide ${guide.slug}: unknown market ${slug}`))
    guide.featuredPlatformSlugs.forEach((slug) => assert(platformSlugSet.has(slug), `guide ${guide.slug}: unknown platform ${slug}`))
    validateGuideTranslations(guide.translations, `guide ${guide.slug}`)
  })

  ads.forEach((ad) => {
    assert(!adIdSet.has(ad.id), `ads: duplicate id ${ad.id}`)
    adIdSet.add(ad.id)
    assert(placementKeySet.has(ad.placementKey), `ad ${ad.id}: unknown placement ${ad.placementKey}`)
    assert(locales.includes(ad.locale), `ad ${ad.id}: invalid locale ${ad.locale}`)
    assert(["home", "category", "market", "platform", "guide"].includes(ad.targetType), `ad ${ad.id}: invalid targetType`)
    assert(["reserved", "active"].includes(ad.status), `ad ${ad.id}: invalid status`)
    assert(Number.isInteger(ad.priority), `ad ${ad.id}: invalid priority`)
    assert(ad.targetSlug === null || (typeof ad.targetSlug === "string" && ad.targetSlug.length > 0), `ad ${ad.id}: invalid targetSlug`)
    assert(typeof ad.targetUrl === "string" && (ad.targetUrl.startsWith("/") || ad.targetUrl.startsWith("http")), `ad ${ad.id}: invalid targetUrl`)
    assert(typeof ad.title === "string" && ad.title.length > 0, `ad ${ad.id}: missing title`)
    assert(typeof ad.description === "string" && ad.description.length > 0, `ad ${ad.id}: missing description`)
    assert(typeof ad.ctaText === "string" && ad.ctaText.length > 0, `ad ${ad.id}: missing ctaText`)
    assert(typeof ad.sponsorName === "string" && ad.sponsorName.length > 0, `ad ${ad.id}: missing sponsorName`)
    assert(typeof ad.disclosureLabel === "string" && ad.disclosureLabel.length > 0, `ad ${ad.id}: missing disclosureLabel`)
    if (ad.startDate !== null) {
      assert(/^\d{4}-\d{2}-\d{2}$/.test(ad.startDate), `ad ${ad.id}: invalid startDate`)
    }
    if (ad.endDate !== null) {
      assert(/^\d{4}-\d{2}-\d{2}$/.test(ad.endDate), `ad ${ad.id}: invalid endDate`)
    }
    if (ad.startDate && ad.endDate) {
      assert(ad.startDate <= ad.endDate, `ad ${ad.id}: startDate must be on or before endDate`)
    }

    const isCurrentlyActive =
      ad.status === "active" &&
      (!ad.startDate || ad.startDate <= currentDateKey) &&
      (!ad.endDate || ad.endDate >= currentDateKey)

    if (isCurrentlyActive) {
      const counterKey = `${ad.placementKey}:${ad.locale}:${ad.targetType}:${ad.targetSlug ?? "all"}`
      placementCountMap.set(counterKey, (placementCountMap.get(counterKey) ?? 0) + 1)
    }
  })

  placementCountMap.forEach((count, counterKey) => {
    const [placementKey] = counterKey.split(":")
    const placement = placements.find((item) => item.key === placementKey)
    assert(placement, `ads: unknown placement in counter ${placementKey}`)
    assert(count <= placement.maxItems, `ads: placement ${counterKey} exceeds maxItems ${placement.maxItems}`)
  })

  console.log(
    JSON.stringify(
      {
        categories: categories.length,
        tools: tools.length,
        markets: markets.length,
        platforms: platforms.length,
        guides: guides.length,
        ads: ads.length,
        status: "ok"
      },
      null,
      2
    )
  )
}

main()
