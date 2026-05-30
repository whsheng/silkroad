export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function createInitials(name: string) {
  const cleaned = name.trim()

  if (!cleaned) {
    return "ST"
  }

  const chineseMatches = cleaned.match(/[\u4e00-\u9fa5]/g)
  if (chineseMatches && chineseMatches.length >= 2) {
    return chineseMatches.slice(0, 2).join("")
  }

  const parts = cleaned
    .split(/[\s/-]+/)
    .filter(Boolean)
    .slice(0, 2)

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || cleaned.slice(0, 2).toUpperCase()
}

export function colorFromString(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash % 360)
  return `hsl(${hue} 45% 42%)`
}
