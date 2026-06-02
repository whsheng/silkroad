import Link from "next/link"

export function EmptyStateCard({
  title,
  description,
  ctaLabel,
  ctaHref
}: {
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-border bg-secondary/20 p-6">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
      <Link
        href={ctaHref}
        className="mt-5 inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30"
      >
        {ctaLabel}
      </Link>
    </div>
  )
}
