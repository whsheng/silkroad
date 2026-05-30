import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"

export function LinkTile({
  title,
  description,
  href,
  meta
}: {
  title: string
  description: string
  href: string
  meta?: ReactNode
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-3xl border border-border/70 bg-white/80 p-5 transition-transform duration-200 hover:-translate-y-1 hover:border-primary/25 dark:bg-card/60"
    >
      {meta ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700/80">{meta}</p> : null}
      <h3 className="mt-3 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-amber-800 transition-colors group-hover:text-amber-600">
        <span>Explore</span>
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  )
}
