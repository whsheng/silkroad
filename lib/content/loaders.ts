import { cache } from "react"
import fs from "node:fs"
import path from "node:path"

import { defaultLocale, locales, type Locale } from "@/lib/i18n/config"
import type {
  AdItemRecord,
  AdPlacementRecord,
  CategoryRecord,
  ContentData,
  GuideRecord,
  MarketRecord,
  PlatformRecord,
  SearchEntry,
  ToolRecord,
  Translation
} from "@/lib/content/types"

const contentRoot = path.join(process.cwd(), "content")

function readJsonFile<T>(relativePath: string): T {
  const filePath = path.join(contentRoot, relativePath)
  const fileContents = fs.readFileSync(filePath, "utf8")
  return JSON.parse(fileContents) as T
}

export const getContentData = cache((): ContentData => {
  const categories = readJsonFile<CategoryRecord[]>("categories/index.json")
  const tools = readJsonFile<ToolRecord[]>("tools/index.json")
  const markets = readJsonFile<MarketRecord[]>("markets/index.json")
  const platforms = readJsonFile<PlatformRecord[]>("platforms/index.json")
  const guides = readJsonFile<GuideRecord[]>("guides/index.json")
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

  return data.tools.map((tool) => ({
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
      translation: guide.translations[locale] ?? guide.translations[defaultLocale]
    }))
}

export function getGuideBySlug(locale: Locale, slug: string) {
  return getGuides(locale).find((guide) => guide.slug === slug)
}

export function getAds(locale: Locale, targetType: AdItemRecord["targetType"], targetSlug: string | null = null) {
  return getContentData().adItems.filter(
    (item) =>
      item.status === "active" && item.locale === locale && item.targetType === targetType && item.targetSlug === targetSlug
  )
}

export function getStats() {
  const data = getContentData()

  return {
    categoryCount: data.categories.length,
    toolCount: data.tools.length,
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
  const tools = data.tools.map((tool) => {
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
