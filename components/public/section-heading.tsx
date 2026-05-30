export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <div className="space-y-3">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700/80">{eyebrow}</p> : null}
      <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
      {description ? <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p> : null}
    </div>
  )
}
