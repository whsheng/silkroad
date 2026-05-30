import fs from "node:fs"
import path from "node:path"

const repoRoot = process.cwd()
const contentRoot = path.join(repoRoot, "content")
const outputRoot = path.join(repoRoot, "public", "generated", "search")
const locales = ["zh-CN", "en"]

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(contentRoot, relativePath), "utf8"))
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function main() {
  ensureDir(outputRoot)

  const categories = readJson("categories/index.json")
  const tools = readJson("tools/index.json")
  const markets = readJson("markets/index.json")
  const platforms = readJson("platforms/index.json")
  const guides = readJson("guides/index.json")

  locales.forEach((locale) => {
    const categoryTranslations = readJson(`categories/translations/${locale}.json`)
    const marketTranslations = readJson(`markets/translations/${locale}.json`)
    const platformTranslations = readJson(`platforms/translations/${locale}.json`)

    const entries = [
      ...categories.map((category) => ({
        type: "category",
        title: categoryTranslations[category.slug].name,
        description: categoryTranslations[category.slug].shortDescription,
        href: `/${locale}/category/${category.slug}`,
        external: false
      })),
      ...markets.map((market) => ({
        type: "market",
        title: marketTranslations[market.slug].name,
        description: marketTranslations[market.slug].shortDescription,
        href: `/${locale}/market/${market.slug}`,
        external: false
      })),
      ...platforms.map((platform) => ({
        type: "platform",
        title: platformTranslations[platform.slug].name,
        description: platformTranslations[platform.slug].shortDescription,
        href: `/${locale}/platform/${platform.slug}`,
        external: false
      })),
      ...guides.map((guide) => ({
        type: "guide",
        title: guide.translations[locale].title,
        description: guide.translations[locale].summary,
        href: `/${locale}/guide/${guide.slug}`,
        external: false
      })),
      ...tools.map((tool) => ({
        type: "tool",
        title: tool.translations[locale].name,
        description: tool.translations[locale].summary,
        href: tool.officialUrl,
        external: true
      }))
    ]

    fs.writeFileSync(path.join(outputRoot, `${locale}.json`), `${JSON.stringify(entries, null, 2)}\n`)
  })
}

main()
