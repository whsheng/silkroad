import { cache } from "react"
import fs from "node:fs"
import path from "node:path"

import { defaultLocale, locales, type Locale } from "@/lib/i18n/config"
import guideContentUtils from "@/lib/content/guides-shared.js"
import * as toolContentUtils from "@/lib/content/tools-shared.mjs"
import type {
  AdItemRecord,
  AdPlacementRecord,
  CategoryRecord,
  ContentData,
  GuideRecord,
  GuideTranslation,
  MarketRecord,
  PlatformRecord,
  SearchEntry,
  ToolRecord,
  Translation
} from "@/lib/content/types"

const contentRoot = path.join(process.cwd(), "content")
const adScheduleTimeZone = "Asia/Shanghai"

function readJsonFile<T>(relativePath: string): T {
  const filePath = path.join(contentRoot, relativePath)
  const fileContents = fs.readFileSync(filePath, "utf8")
  return JSON.parse(fileContents) as T
}

export const getContentData = cache((): ContentData => {
  const categories = readJsonFile<CategoryRecord[]>("categories/index.json")
  const tools = readJsonFile<ToolRecord[]>("tools/index.json").map((tool) => toolContentUtils.normalizeToolRecord(tool))
  const markets = readJsonFile<MarketRecord[]>("markets/index.json")
  const platforms = readJsonFile<PlatformRecord[]>("platforms/index.json")
  const guides = guideContentUtils.loadGuideRecordsFromContent(contentRoot, {
    defaultLocale,
    locales,
    includeDrafts: false
  }) as GuideRecord[]
  const adPlacements = readJsonFile<AdPlacementRecord[]>("ads/placements.json")
  const adItems = readJsonFile<AdItemRecord[]>("ads/items.json")

  const categoryTranslations = Object.fromEntries(
    locales.map((locale) => [locale, readJsonFile<Record<string, Translation>>(`categories/translations/${locale}.json`)])
  ) as ContentData["categoryTranslations"]

  const marketTranslations = Object.fromEntries(
    locales.map((locale) => [locale, readJsonFile<Record<string, Translation>>(`markets/translations/${locale}.json`)])
  ) as ContentData["marketTranslations"]

  const platformTranslations = Object.fromEntries(
    locales.map((locale) => [locale, readJsonFile<Record<string, Translation>>(`platforms/translations/${locale}.json`)])
  ) as ContentData["platformTranslations"]

  return {
    categories,
    categoryTranslations,
    tools,
    markets,
    marketTranslations,
    platforms,
    platformTranslations,
    guides,
    adPlacements,
    adItems
  }
})

export function getCategories(locale: Locale) {
  const data = getContentData()

  return data.categories.map((category) => ({
    ...category,
    translation: data.categoryTranslations[locale][category.slug]
  }))
}

export function getCategoryBySlug(locale: Locale, slug: string) {
  return getCategories(locale).find((category) => category.slug === slug)
}

export function getTools(locale: Locale) {
  const data = getContentData()

  return data.tools
    .filter((tool) => toolContentUtils.isToolPublished(tool))
    .map((tool) => ({
      ...tool,
      translation: tool.translations[locale] ?? tool.translations[defaultLocale]
    }))
}

export function getToolBySlug(locale: Locale, slug: string) {
  return getTools(locale).find((tool) => tool.slug === slug)
}

export function getToolsBySlugs(locale: Locale, slugs: string[]) {
  const allTools = getTools(locale)
  const toolMap = new Map(allTools.map((tool) => [tool.slug, tool]))
  return slugs.map((slug) => toolMap.get(slug)).filter(Boolean) as ReturnType<typeof getTools>
}

export function getFeaturedTools(locale: Locale, limit = 12) {
  return getTools(locale)
    .filter((tool) => tool.isFeatured)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
}

export function getMarkets(locale: Locale) {
  const data = getContentData()

  return data.markets.map((market) => ({
    ...market,
    translation: data.marketTranslations[locale][market.slug]
  }))
}

export function getMarketBySlug(locale: Locale, slug: string) {
  return getMarkets(locale).find((market) => market.slug === slug)
}

export function getPlatforms(locale: Locale) {
  const data = getContentData()

  return data.platforms.map((platform) => ({
    ...platform,
    translation: data.platformTranslations[locale][platform.slug]
  }))
}

export function getPlatformBySlug(locale: Locale, slug: string) {
  return getPlatforms(locale).find((platform) => platform.slug === slug)
}

export function getGuides(locale: Locale) {
  const data = getContentData()

  return data.guides
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((guide) => ({
      ...guide,
      translation: (guide.translations[locale] ?? guide.translations[defaultLocale]) as GuideTranslation | undefined
    }))
    .filter((guide): guide is GuideRecord & { translation: GuideTranslation } => Boolean(guide.translation))
}

export function getGuideBySlug(locale: Locale, slug: string) {
  return getGuides(locale).find((guide) => guide.slug === slug)
}

function getCurrentDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: adScheduleTimeZone
  }).format(new Date())
}

function isAdLive(item: AdItemRecord, dateKey: string) {
  const startsBeforeOrToday = !item.startDate || item.startDate <= dateKey
  const endsAfterOrToday = !item.endDate || item.endDate >= dateKey

  return item.status === "active" && startsBeforeOrToday && endsAfterOrToday
}

export function getAdsForPlacement(
  locale: Locale,
  placementKey: string,
  targetType: AdItemRecord["targetType"],
  targetSlug: string | null = null
) {
  const data = getContentData()
  const placement = data.adPlacements.find((item) => item.key === placementKey)

  if (!placement) {
    return []
  }

  const today = getCurrentDateKey()

  return data.adItems
    .filter((item) => {
      if (item.locale !== locale || item.placementKey !== placementKey || item.targetType !== targetType) {
        return false
      }

      if (!isAdLive(item, today)) {
        return false
      }

      return item.targetSlug === null || item.targetSlug === targetSlug
    })
    .sort((left, right) => right.priority - left.priority)
    .slice(0, placement.maxItems)
}

export function getStats() {
  const data = getContentData()
  const publishedTools = data.tools.filter((tool) => toolContentUtils.isToolPublished(tool))

  return {
    categoryCount: data.categories.length,
    toolCount: publishedTools.length,
    marketCount: data.markets.length,
    platformCount: data.platforms.length
  }
}

export function getSearchEntries(locale: Locale): SearchEntry[] {
  const data = getContentData()
  const categories = getCategories(locale).map((category) => ({
    type: "category" as const,
    title: category.translation.name,
    description: category.translation.shortDescription,
    href: `/${locale}/category/${category.slug}`,
    external: false
  }))
  const markets = getMarkets(locale).map((market) => ({
    type: "market" as const,
    title: market.translation.name,
    description: market.translation.shortDescription,
    href: `/${locale}/market/${market.slug}`,
    external: false
  }))
  const platforms = getPlatforms(locale).map((platform) => ({
    type: "platform" as const,
    title: platform.translation.name,
    description: platform.translation.shortDescription,
    href: `/${locale}/platform/${platform.slug}`,
    external: false
  }))
  const guides = getGuides(locale).map((guide) => ({
    type: "guide" as const,
    title: guide.translation.title,
    description: guide.translation.summary,
    href: `/${locale}/guide/${guide.slug}`,
    external: false
  }))
  const tools = data.tools
    .filter((tool) => toolContentUtils.isToolPublished(tool))
    .map((tool) => {
    const translation = tool.translations[locale] ?? tool.translations[defaultLocale]

    return {
      type: "tool" as const,
      title: translation.name,
      description: translation.summary,
      href: tool.officialUrl,
      external: true
    }
    })

  return [...categories, ...markets, ...platforms, ...guides, ...tools]
}

export function getPublishedToolSlugSet() {
  const data = getContentData()

  return new Set(data.tools.filter((tool) => toolContentUtils.isToolPublished(tool)).map((tool) => tool.slug))
}
