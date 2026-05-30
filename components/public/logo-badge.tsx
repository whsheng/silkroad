import { colorFromString, createInitials } from "@/lib/content/utils"

export function LogoBadge({
  name,
  domain
}: {
  name: string
  domain: string
}) {
  const initials = createInitials(name)
  const background = colorFromString(domain || name)

  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-sm"
      style={{ background }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}
