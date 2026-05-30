import type { Locale } from "@/lib/i18n/config"
import type { ToolRecord } from "@/lib/content/types"
import { ToolCard } from "@/components/public/tool-card"

export function ToolGrid({
  locale,
  tools
}: {
  locale: Locale
  tools: Array<ToolRecord & { translation: ToolRecord["translations"][Locale] }>
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.slug} locale={locale} tool={tool} />
      ))}
    </div>
  )
}
