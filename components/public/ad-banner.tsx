"use client"

import Link from "next/link"

import type { Locale } from "@/lib/i18n/config"
import type { AdItemRecord } from "@/lib/content/types"
import { trackAdClick } from "@/lib/analytics/gtag"

function resolveInternalTargetUrl(locale: Locale, targetUrl: string) {
  if (!targetUrl.startsWith("/")) {
    return targetUrl
  }

  if (targetUrl === "/") {
    return `/${locale}`
  }

  return targetUrl.startsWith(`/${locale}/`) || targetUrl === `/${locale}`
    ? targetUrl
    : `/${locale}${targetUrl}`
}

export function AdBanner({
  locale,
  item
}: {
  locale: Locale
  item: AdItemRecord
}) {
  const isInternal = item.targetUrl.startsWith("/")
  const href = isInternal ? resolveInternalTargetUrl(locale, item.targetUrl) : item.targetUrl

  function handleClick() {
    trackAdClick({
      adId: item.id,
      placementKey: item.placementKey,
      locale,
      targetType: item.targetType,
      targetSlug: item.targetSlug,
      targetUrl: href
    })
  }

  const content = (
    <div className="rounded-[2rem] border border-amber-300/50 bg-[linear-gradient(135deg,rgba(255,248,235,0.92),rgba(255,255,255,0.96))] p-6 shadow-[0_16px_50px_rgba(146,64,14,0.08)] dark:border-amber-700/30 dark:bg-[linear-gradient(135deg,rgba(69,26,3,0.24),rgba(30,22,17,0.9))]">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700/80">
        <span>{item.disclosureLabel}</span>
        <span>{item.sponsorName}</span>
      </div>
      <h3 className="mt-3 text-xl font-semibold text-foreground">{item.title}</h3>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">{item.description}</p>
      <span className="mt-4 inline-flex rounded-full border border-amber-700/20 px-4 py-2 text-sm font-medium text-amber-800">
        {item.ctaText}
      </span>
    </div>
  )

  if (isInternal) {
    return (
      <Link href={href} onClick={handleClick}>
        {content}
      </Link>
    )
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={handleClick}>
      {content}
    </a>
  )
}
