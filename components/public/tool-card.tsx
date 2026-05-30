import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { LogoBadge } from "@/components/public/logo-badge"
import type { Locale } from "@/lib/i18n/config"
import type { ToolRecord } from "@/lib/content/types"

export function ToolCard({
  locale,
  tool
}: {
  locale: Locale
  tool: ToolRecord & { translation: ToolRecord["translations"][Locale] }
}) {
  return (
    <article className="group flex h-full flex-col rounded-3xl border border-border/70 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-transform duration-200 hover:-translate-y-1 dark:bg-card/60">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <LogoBadge name={tool.translation.name} domain={tool.normalizedDomain} />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{tool.translation.name}</h3>
            <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{tool.translation.summary}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tool.categorySlugs.slice(0, 2).map((slug) => (
          <Link
            key={slug}
            href={`/${locale}/category/${slug}`}
            className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            {slug}
          </Link>
        ))}
      </div>
      <div className="mt-auto pt-5">
        <Link
          href={tool.officialUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-800 transition-colors hover:text-amber-600"
        >
          <span>{locale === "zh-CN" ? "访问官网" : "Visit website"}</span>
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
