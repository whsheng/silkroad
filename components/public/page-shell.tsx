import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { SearchDialog } from "@/components/public/search-dialog"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/get-dictionary"

type Breadcrumb = {
  label: string
  href?: string
}

export function PageShell({
  locale,
  dictionary,
  breadcrumbs,
  children
}: {
  locale: Locale
  dictionary: Dictionary
  breadcrumbs: Breadcrumb[]
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 md:px-8 md:py-12">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((item, index) => (
            <div key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href ? (
                <Link href={item.href} className="transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground">{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 ? <ChevronRight className="h-4 w-4" /> : null}
            </div>
          ))}
        </div>
        <SearchDialog locale={locale} label={dictionary.header.search} />
      </div>
      {children}
    </div>
  )
}
