import type { Metadata } from "next"

import { locales, type Locale } from "@/lib/i18n/config"
import { siteDescription, siteName, siteTitle, siteUrl } from "@/lib/seo/site"

type MetadataInput = {
  locale: Locale
  pathname: string
  title?: string
  description?: string
}

function normalizePathname(pathname: string) {
  if (!pathname || pathname === "/") {
    return ""
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`
}

function getCanonicalUrl(locale: Locale, pathname: string) {
  const cleanPathname = normalizePathname(pathname)
  return `${siteUrl}/${locale}${cleanPathname}`
}

export function buildMetadata({ locale, pathname, title, description }: MetadataInput): Metadata {
  const canonical = getCanonicalUrl(locale, pathname)
  const cleanPathname = normalizePathname(pathname)
  const languages = Object.fromEntries(locales.map((item) => [item, `${siteUrl}/${item}${cleanPathname}`]))

  return {
    metadataBase: new URL(siteUrl),
    title: title ?? siteTitle[locale],
    description: description ?? siteDescription[locale],
    alternates: {
      canonical,
      languages
    },
    openGraph: {
      title: title ?? siteTitle[locale],
      description: description ?? siteDescription[locale],
      url: canonical,
      siteName: siteName[locale],
      locale,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? siteTitle[locale],
      description: description ?? siteDescription[locale]
    }
  }
}
