import fs from "node:fs"
import path from "node:path"

const repoRoot = process.cwd()
const contentRoot = path.join(repoRoot, "content")
const locales = ["zh-CN", "en"]

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
  const guides = readJson("guides/index.json")
  const tools = readJson("tools/index.json")
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
    assert(Array.isArray(tool.categorySlugs) && tool.categorySlugs.length > 0, `tool ${tool.slug}: missing categorySlugs`)
    assert(Array.isArray(tool.marketSlugs) && tool.marketSlugs.length > 0, `tool ${tool.slug}: missing marketSlugs`)
    assert(Array.isArray(tool.platformSlugs) && tool.platformSlugs.length > 0, `tool ${tool.slug}: missing platformSlugs`)
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
    validateTranslations(guide.translations, `guide ${guide.slug}`)
  })

  ads.forEach((ad) => {
    assert(placementKeySet.has(ad.placementKey), `ad ${ad.id}: unknown placement ${ad.placementKey}`)
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
