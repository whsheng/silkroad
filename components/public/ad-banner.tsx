import Link from "next/link"

import type { Locale } from "@/lib/i18n/config"
import type { AdItemRecord } from "@/lib/content/types"

export function AdBanner({
  locale,
  item
}: {
  locale: Locale
  item: AdItemRecord
}) {
  const isInternal = item.targetUrl.startsWith("/")

  const content = (
    <div className="rounded-[2rem] border border-dashed border-amber-400/60 bg-amber-50/90 p-6 dark:bg-amber-950/20">
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
    return <Link href={item.targetUrl === "/" ? `/${locale}` : item.targetUrl}>{content}</Link>
  }

  return (
    <a href={item.targetUrl} target="_blank" rel="noreferrer">
      {content}
    </a>
  )
}
