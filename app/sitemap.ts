import type { MetadataRoute } from "next"

import { getCategories, getGuides, getMarkets, getPlatforms } from "@/lib/content/loaders"
import { locales } from "@/lib/i18n/config"
import { siteUrl } from "@/lib/seo/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  locales.forEach((locale) => {
    entries.push({
      url: `${siteUrl}/${locale}`,
      changeFrequency: "weekly",
      priority: 1
    })

    getCategories(locale).forEach((category) => {
      entries.push({
        url: `${siteUrl}/${locale}/category/${category.slug}`,
        changeFrequency: "weekly",
        priority: 0.9
      })
    })

    getMarkets(locale).forEach((market) => {
      entries.push({
        url: `${siteUrl}/${locale}/market/${market.slug}`,
        changeFrequency: "weekly",
        priority: 0.8
      })
    })

    getPlatforms(locale).forEach((platform) => {
      entries.push({
        url: `${siteUrl}/${locale}/platform/${platform.slug}`,
        changeFrequency: "weekly",
        priority: 0.8
      })
    })

    getGuides(locale).forEach((guide) => {
      entries.push({
        url: `${siteUrl}/${locale}/guide/${guide.slug}`,
        changeFrequency: "monthly",
        priority: 0.7
      })
    })
  })

  return entries
}
