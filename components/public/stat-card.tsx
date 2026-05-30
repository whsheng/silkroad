export function StatCard({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-white/80 p-5 dark:bg-card/60">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  )
}
