import type { Locale } from "@/lib/i18n/config"

export type Translation = {
  locale: Locale
  name: string
  shortDescription: string
  seoTitle: string
  seoDescription: string
  intro: string
}

export type CategoryRecord = {
  id: string
  slug: string
  sortOrder: number
  isFeatured: boolean
  toolSlugs: string[]
  marketSlugs: string[]
  platformSlugs: string[]
}

export type ToolTranslation = {
  locale: Locale
  name: string
  summary: string
  description: string
  bestFor: string
  notFor: string
  pricingNotes: string
  seoTitle: string
  seoDescription: string
}

export type ToolRecord = {
  id: string
  slug: string
  nameDefault: string
  officialUrl: string
  normalizedDomain: string
  pricingModel: "free" | "freemium" | "paid" | "custom" | "unknown"
  supportsChinese: boolean
  verificationStatus: "seed" | "reviewed"
  sourceType: "seed_import" | "manual_editor"
  categorySlugs: string[]
  marketSlugs: string[]
  platformSlugs: string[]
  isFeatured: boolean
  score: number
  translations: Record<Locale, ToolTranslation>
}

export type MarketRecord = {
  id: string
  slug: string
  sortOrder: number
  featuredCategorySlugs: string[]
  featuredPlatformSlugs: string[]
}

export type PlatformRecord = {
  id: string
  slug: string
  sortOrder: number
  featuredCategorySlugs: string[]
  featuredMarketSlugs: string[]
}

export type GuideRecord = {
  id: string
  slug: string
  sortOrder: number
  featuredCategorySlugs: string[]
  featuredMarketSlugs: string[]
  featuredPlatformSlugs: string[]
  publishedAt: string
  updatedAt: string
  translations: Record<
    Locale,
    {
      title: string
      summary: string
      content: string[]
      seoTitle: string
      seoDescription: string
    }
  >
}

export type AdPlacementRecord = {
  key: string
  name: string
  description: string
  maxItems: number
}

export type AdItemRecord = {
  id: string
  placementKey: string
  locale: Locale
  targetType: "home" | "category" | "market" | "platform" | "guide"
  targetSlug: string | null
  title: string
  description: string
  ctaText: string
  targetUrl: string
  sponsorName: string
  disclosureLabel: string
  status: "reserved" | "active"
}

export type SearchEntry = {
  type: "tool" | "category" | "market" | "platform" | "guide"
  title: string
  description: string
  href: string
  external: boolean
}

export type ContentData = {
  categories: CategoryRecord[]
  categoryTranslations: Record<Locale, Record<string, Translation>>
  tools: ToolRecord[]
  markets: MarketRecord[]
  marketTranslations: Record<Locale, Record<string, Translation>>
  platforms: PlatformRecord[]
  platformTranslations: Record<Locale, Record<string, Translation>>
  guides: GuideRecord[]
  adPlacements: AdPlacementRecord[]
  adItems: AdItemRecord[]
}
