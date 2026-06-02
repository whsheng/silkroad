import fs from "node:fs"
import path from "node:path"

const repoRoot = process.cwd()
const configPath = path.join(repoRoot, "config", "site.ts")
const contentRoot = path.join(repoRoot, "content")

const categoryMarketMap = {
  "热门平台": ["us", "eu", "sea"],
  "常用工具": ["us", "eu"],
  "平台大全": ["us", "eu", "middle-east"],
  "论坛资讯": ["us", "eu"],
  "跨境服务": ["us", "eu", "uk"],
  "培训教程": ["us", "eu"],
  "本土货源": ["us", "eu", "sea"],
  "AI工具箱": ["us", "eu"],
  "独立站": ["us", "eu", "sea"],
  "官方专区": ["us", "eu", "uk"],
  "推荐插件": ["us", "eu"],
  "本土新闻资讯": ["us", "eu", "middle-east"]
}

const categoryPlatformMap = {
  "热门平台": ["amazon", "tiktok-shop", "shopify"],
  "常用工具": ["amazon", "independent-site"],
  "平台大全": ["amazon", "shopify", "walmart"],
  "论坛资讯": ["amazon", "independent-site"],
  "跨境服务": ["amazon", "shopify"],
  "培训教程": ["amazon", "independent-site"],
  "本土货源": ["amazon", "shopify", "independent-site"],
  "AI工具箱": ["independent-site", "shopify"],
  "独立站": ["shopify", "independent-site"],
  "官方专区": ["amazon", "walmart", "tiktok-shop"],
  "推荐插件": ["shopify", "independent-site"],
  "本土新闻资讯": ["amazon", "independent-site"]
}

const categorySlugMap = {
  "热门平台": "popular-platforms",
  "常用工具": "core-tools",
  "平台大全": "platform-directory",
  "论坛资讯": "forums-news",
  "跨境服务": "cross-border-services",
  "培训教程": "training-courses",
  "本土货源": "local-sourcing",
  "AI工具箱": "ai-toolbox",
  "独立站": "independent-sites",
  "官方专区": "official-portals",
  "推荐插件": "recommended-plugins",
  "本土新闻资讯": "local-market-news"
}

const marketSeeds = [
  {
    id: "market-us",
    slug: "us",
    sortOrder: 1,
    featuredCategorySlugs: ["popular-platforms", "cross-border-services", "independent-sites"],
    featuredPlatformSlugs: ["amazon", "independent-site"],
    translations: {
      "zh-CN": {
        name: "美国市场",
        shortDescription: "适合中国卖家优先进入的成熟跨境电商市场，覆盖亚马逊、独立站、支付与物流服务。",
        seoTitle: "美国市场工具导航 | Silkroads Trade",
        seoDescription: "聚合美国市场常用平台、支付、物流、建站与营销工具，帮助中国卖家更快制定出海方案。",
        intro: "美国市场仍是中国跨境卖家的核心目标市场，工具选择需要兼顾流量、履约、支付和品牌化运营。"
      },
      en: {
        name: "United States",
        shortDescription: "A mature market for China-based sellers across Amazon, independent sites, payment, and logistics workflows.",
        seoTitle: "United States Market Tools | Silkroads Trade",
        seoDescription: "Explore platforms, logistics, payment, and growth tools relevant to the US market.",
        intro: "The US remains a priority market for China-based export teams and requires strong tooling across fulfillment and growth."
      }
    }
  },
  {
    id: "market-eu",
    slug: "eu",
    sortOrder: 2,
    featuredCategorySlugs: ["popular-platforms", "cross-border-services", "official-portals"],
    featuredPlatformSlugs: ["amazon", "shopify"],
    translations: {
      "zh-CN": {
        name: "欧洲市场",
        shortDescription: "重点关注欧洲站点、VAT、合规与本地履约资源，适合品牌化与多站点布局。",
        seoTitle: "欧洲市场工具导航 | Silkroads Trade",
        seoDescription: "围绕欧洲平台、合规、物流、支付和本地化增长工具构建的市场入口。",
        intro: "欧洲市场重视合规和多语言运营，适合中长期品牌布局与多国运营。"
      },
      en: {
        name: "Europe",
        shortDescription: "Focused on compliance, VAT, local fulfillment, and multi-country marketplace operations.",
        seoTitle: "Europe Market Tools | Silkroads Trade",
        seoDescription: "Find tools and service partners for European market entry, compliance, and operations.",
        intro: "Europe requires strong localization and compliance capabilities across multiple countries."
      }
    }
  },
  {
    id: "market-uk",
    slug: "uk",
    sortOrder: 3,
    featuredCategorySlugs: ["popular-platforms", "official-portals"],
    featuredPlatformSlugs: ["amazon", "walmart"],
    translations: {
      "zh-CN": {
        name: "英国市场",
        shortDescription: "适合独立拆分观察的平台和合规市场，关注站点运营、物流和税务工具。",
        seoTitle: "英国市场工具导航 | Silkroads Trade",
        seoDescription: "聚合英国市场的平台、物流、支付与税务相关工具和服务商。",
        intro: "英国市场适合单独建模，便于评估本地配送、税务与站点策略。"
      },
      en: {
        name: "United Kingdom",
        shortDescription: "A focused market for platform operations, logistics, tax, and localized commerce workflows.",
        seoTitle: "United Kingdom Market Tools | Silkroads Trade",
        seoDescription: "Tooling and service partners for sellers operating in the UK market.",
        intro: "The UK is useful to evaluate as a standalone market with distinct logistics and tax workflows."
      }
    }
  },
  {
    id: "market-sea",
    slug: "sea",
    sortOrder: 4,
    featuredCategorySlugs: ["popular-platforms", "local-sourcing", "independent-sites"],
    featuredPlatformSlugs: ["tiktok-shop", "shopify"],
    translations: {
      "zh-CN": {
        name: "东南亚市场",
        shortDescription: "面向 TikTok Shop、本地平台与独立站增长的快节奏市场，关注履约和渠道搭建。",
        seoTitle: "东南亚市场工具导航 | Silkroads Trade",
        seoDescription: "查看适合东南亚市场的平台、内容电商、物流和本地化运营工具。",
        intro: "东南亚市场增长快，适合内容电商、短视频分销与多平台布局。"
      },
      en: {
        name: "Southeast Asia",
        shortDescription: "Fast-moving market suited for TikTok Shop, local marketplaces, and lean fulfillment strategies.",
        seoTitle: "Southeast Asia Market Tools | Silkroads Trade",
        seoDescription: "Explore tools for Southeast Asia market operations across content commerce and logistics.",
        intro: "Southeast Asia rewards fast execution across content commerce, local marketplaces, and fulfillment."
      }
    }
  },
  {
    id: "market-middle-east",
    slug: "middle-east",
    sortOrder: 5,
    featuredCategorySlugs: ["platform-directory", "cross-border-services"],
    featuredPlatformSlugs: ["independent-site", "shopify"],
    translations: {
      "zh-CN": {
        name: "中东市场",
        shortDescription: "聚焦本地渠道、支付方式与区域履约资源，适合探索差异化增长路径。",
        seoTitle: "中东市场工具导航 | Silkroads Trade",
        seoDescription: "查看中东市场相关的平台、支付、履约和营销工具。",
        intro: "中东市场具备高客单与渠道差异，适合做好支付和本地履约准备。"
      },
      en: {
        name: "Middle East",
        shortDescription: "Relevant for regional channels, payment options, and localized fulfillment strategies.",
        seoTitle: "Middle East Market Tools | Silkroads Trade",
        seoDescription: "Explore service partners and tooling for Middle East market expansion.",
        intro: "The Middle East can reward differentiated growth with strong payment and regional fulfillment support."
      }
    }
  }
]

const platformSeeds = [
  {
    id: "platform-amazon",
    slug: "amazon",
    sortOrder: 1,
    featuredCategorySlugs: ["popular-platforms", "cross-border-services", "official-portals"],
    featuredMarketSlugs: ["us", "eu", "uk"],
    translations: {
      "zh-CN": {
        name: "Amazon",
        shortDescription: "适合围绕选品、运营、广告、物流和账户体系来组织的成熟平台生态。",
        seoTitle: "Amazon 工具导航 | Silkroads Trade",
        seoDescription: "聚合 Amazon 运营、广告、选品、物流与服务商工具，帮助中国卖家优化平台运营。",
        intro: "Amazon 仍然是中国卖家最重要的平台之一，需要完整的运营工具与服务商支持。"
      },
      en: {
        name: "Amazon",
        shortDescription: "A mature ecosystem spanning operations, ads, sourcing, logistics, and account workflows.",
        seoTitle: "Amazon Tools | Silkroads Trade",
        seoDescription: "Explore tools and service providers relevant to Amazon operations and growth.",
        intro: "Amazon remains a core platform for China-based sellers and requires mature tooling across the stack."
      }
    }
  },
  {
    id: "platform-shopify",
    slug: "shopify",
    sortOrder: 2,
    featuredCategorySlugs: ["independent-sites", "recommended-plugins", "ai-toolbox"],
    featuredMarketSlugs: ["us", "eu", "sea"],
    translations: {
      "zh-CN": {
        name: "Shopify",
        shortDescription: "适合独立站建站、插件扩展、营销自动化与品牌化运营的主流平台。",
        seoTitle: "Shopify 工具导航 | Silkroads Trade",
        seoDescription: "查看适合 Shopify 建站、插件、支付、营销与运营的工具与资源。",
        intro: "Shopify 是独立站最常见的主平台，适合搭建品牌资产和长期增长体系。"
      },
      en: {
        name: "Shopify",
        shortDescription: "Popular for independent sites, plugins, marketing automation, and brand-led growth.",
        seoTitle: "Shopify Tools | Silkroads Trade",
        seoDescription: "Find tools and resources for Shopify storefronts, plugins, and growth operations.",
        intro: "Shopify is widely used for brand-owned stores and long-term owned-channel growth."
      }
    }
  },
  {
    id: "platform-tiktok-shop",
    slug: "tiktok-shop",
    sortOrder: 3,
    featuredCategorySlugs: ["popular-platforms", "ai-toolbox", "training-courses"],
    featuredMarketSlugs: ["sea", "us"],
    translations: {
      "zh-CN": {
        name: "TikTok Shop",
        shortDescription: "适合内容电商、短视频带货与达人合作的高速增长平台。",
        seoTitle: "TikTok Shop 工具导航 | Silkroads Trade",
        seoDescription: "查看适合 TikTok Shop 内容电商、投放、素材和履约的工具与服务商。",
        intro: "TikTok Shop 适合高节奏内容电商团队，需要素材、达人与履约协同能力。"
      },
      en: {
        name: "TikTok Shop",
        shortDescription: "Fast-growing content commerce ecosystem for short-form video and creator partnerships.",
        seoTitle: "TikTok Shop Tools | Silkroads Trade",
        seoDescription: "Tooling and services for TikTok Shop operations, creative workflows, and fulfillment.",
        intro: "TikTok Shop favors teams with strong creative and creator collaboration workflows."
      }
    }
  },
  {
    id: "platform-independent-site",
    slug: "independent-site",
    sortOrder: 4,
    featuredCategorySlugs: ["independent-sites", "recommended-plugins", "ai-toolbox"],
    featuredMarketSlugs: ["us", "eu", "middle-east"],
    translations: {
      "zh-CN": {
        name: "独立站",
        shortDescription: "围绕建站、支付、SEO、内容与自动化工具搭建自有品牌增长体系。",
        seoTitle: "独立站工具导航 | Silkroads Trade",
        seoDescription: "聚合独立站建站、SEO、支付、内容和自动化工具，服务中国出海品牌。",
        intro: "独立站是品牌出海的重要基础设施，适合构建自有流量和客户资产。"
      },
      en: {
        name: "Independent Sites",
        shortDescription: "Build owned-channel growth across storefront, SEO, content, and automation workflows.",
        seoTitle: "Independent Site Tools | Silkroads Trade",
        seoDescription: "Explore tooling for owned storefronts, SEO, content, and automation.",
        intro: "Independent sites let teams build owned traffic and customer relationships over time."
      }
    }
  },
  {
    id: "platform-walmart",
    slug: "walmart",
    sortOrder: 5,
    featuredCategorySlugs: ["platform-directory", "official-portals"],
    featuredMarketSlugs: ["us", "uk"],
    translations: {
      "zh-CN": {
        name: "Walmart",
        shortDescription: "适合平台扩展和多渠道布局，关注平台规则、履约与资源整合。",
        seoTitle: "Walmart 工具导航 | Silkroads Trade",
        seoDescription: "查看 Walmart 平台相关的入驻、履约、服务商与运营工具。",
        intro: "Walmart 适合作为多平台布局的一部分，需要更强的平台规则适配能力。"
      },
      en: {
        name: "Walmart",
        shortDescription: "Useful for multi-channel expansion with a focus on rules, fulfillment, and partner fit.",
        seoTitle: "Walmart Tools | Silkroads Trade",
        seoDescription: "Explore resources and partners relevant to Walmart marketplace expansion.",
        intro: "Walmart can complement larger marketplace strategies when teams align on fulfillment and compliance."
      }
    }
  }
]

const guideSeeds = [
  {
    id: "guide-cross-border-stack",
    slug: "cross-border-stack",
    sortOrder: 1,
    featuredCategorySlugs: ["popular-platforms", "core-tools", "cross-border-services"],
    featuredMarketSlugs: ["us", "eu"],
    featuredPlatformSlugs: ["amazon", "independent-site"],
    publishedAt: "2026-05-29",
    updatedAt: "2026-05-29",
    translations: {
      "zh-CN": {
        title: "中国出海团队的一期工具栈怎么搭",
        summary: "围绕平台、物流、支付、内容与 AI 工具，梳理最适合中国团队的最小可行工具栈。",
        content: [
          "一期内容不追求工具数量极多，而追求用户进入后能尽快完成选择。",
          "你可以先围绕平台、支付、履约、建站、内容与 AI 这几条主线搭建站点导航结构。",
          "SEO 页面应优先服务分类页、市场页和平台页，再逐步扩展专题内容。"
        ],
        seoTitle: "中国出海团队一期工具栈搭建指南 | Silkroads Trade",
        seoDescription: "从平台、支付、履约、建站、内容与 AI 工具出发，梳理适合中国出海团队的一期工具栈。"
      },
      en: {
        title: "Building the first practical tool stack for China-based global teams",
        summary: "A practical guide for structuring platforms, logistics, payment, content, and AI tooling.",
        content: [
          "Phase 1 should optimize for clarity and decision speed instead of publishing every possible tool.",
          "Start with platforms, payment, fulfillment, site building, content, and AI as the main navigation pillars.",
          "SEO should focus on category, market, and platform pages before scaling more guide content."
        ],
        seoTitle: "Phase 1 Tool Stack Guide | Silkroads Trade",
        seoDescription: "A practical content and tooling guide for China-based teams building cross-border operations."
      }
    }
  },
  {
    id: "guide-independent-site-launch",
    slug: "independent-site-launch",
    sortOrder: 2,
    featuredCategorySlugs: ["independent-sites", "recommended-plugins", "ai-toolbox"],
    featuredMarketSlugs: ["us", "sea"],
    featuredPlatformSlugs: ["shopify", "independent-site"],
    publishedAt: "2026-05-29",
    updatedAt: "2026-05-29",
    translations: {
      "zh-CN": {
        title: "独立站冷启动最需要先补的工具能力",
        summary: "从建站、支付、SEO、素材到数据监测，梳理独立站冷启动最常见的工具组合。",
        content: [
          "独立站冷启动阶段，最重要的是建站效率、支付稳定性和内容生产速度。",
          "分类页可以围绕建站、插件、SEO、支付和 AI 内容工具做强关联。",
          "避免一开始接入过多第三方脚本，先把速度和索引打稳。"
        ],
        seoTitle: "独立站冷启动工具指南 | Silkroads Trade",
        seoDescription: "聚焦独立站冷启动所需的建站、支付、SEO、内容和数据工具能力。"
      },
      en: {
        title: "The first tool capabilities an independent site launch needs",
        summary: "A launch-oriented view across storefront setup, payment, SEO, creative, and analytics tooling.",
        content: [
          "Independent site launches depend on execution speed, payment reliability, and creative output.",
          "Category pages should strongly connect storefront, plugins, SEO, payment, and AI content tools.",
          "Avoid too many third-party scripts at launch and protect site speed first."
        ],
        seoTitle: "Independent Site Launch Tool Guide | Silkroads Trade",
        seoDescription: "Tooling priorities for launching an independent site with SEO, payment, and creative support."
      }
    }
  }
]

const adPlacements = [
  {
    key: "home_hero_banner",
    name: "首页头图赞助位",
    description: "首页首屏赞助信息预留位",
    maxItems: 1
  },
  {
    key: "category_top_banner",
    name: "分类页顶部赞助位",
    description: "分类页顶部赞助内容预留位",
    maxItems: 1
  }
]

const adItems = [
  {
    id: "ad-home-hero-zh",
    placementKey: "home_hero_banner",
    locale: "zh-CN",
    targetType: "home",
    targetSlug: null,
    title: "赞助位预留",
    description: "一期只预留广告能力，不接入影响性能的第三方广告脚本。",
    ctaText: "查看方案",
    targetUrl: "/zh-CN/submit",
    sponsorName: "Silkroads Trade",
    disclosureLabel: "赞助位",
    status: "reserved"
  },
  {
    id: "ad-home-hero-en",
    placementKey: "home_hero_banner",
    locale: "en",
    targetType: "home",
    targetSlug: null,
    title: "Sponsor slot reserved",
    description: "Phase 1 reserves ad placements without loading heavy third-party scripts.",
    ctaText: "Learn more",
    targetUrl: "/en/submit",
    sponsorName: "Silkroads Trade",
    disclosureLabel: "Sponsored",
    status: "reserved"
  }
]

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function writeJson(relativePath, value) {
  const filePath = path.join(contentRoot, relativePath)
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function parseNavData() {
  const source = fs.readFileSync(configPath, "utf8")
  const startToken = "export const NavData"
  const startIndex = source.indexOf(startToken)
  const arrayStart = source.indexOf("[", startIndex)
  const arrayEnd = source.lastIndexOf("]")
  const raw = source.slice(arrayStart, arrayEnd + 1)
  return Function(`return (${raw})`)()
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function sanitizeText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\"/g, "\"")
    .trim()
}

function normalizeDomain(urlValue) {
  try {
    const url = new URL(urlValue)
    return url.hostname.replace(/^www\./, "")
  } catch {
    return slugify(urlValue)
  }
}

function assignMarkets(categoryTitle, tool) {
  const markets = new Set(categoryMarketMap[categoryTitle] ?? ["us", "eu"])
  const domain = normalizeDomain(tool.link)
  const text = `${tool.title} ${tool.desc} ${domain}`.toLowerCase()

  if (/eu|europe|德国|法国|意大利|西班牙|uk|英国|vat/.test(text)) {
    markets.add("eu")
  }
  if (/uk|英国/.test(text)) {
    markets.add("uk")
  }
  if (/japan|日本|tokyo/.test(text)) {
    markets.add("sea")
  }
  if (/uae|dubai|middle east|中东|阿联酋|沙特/.test(text)) {
    markets.add("middle-east")
  }
  if (/tiktok|temu|lazada|shopee|东南亚/.test(text)) {
    markets.add("sea")
  }

  return [...markets]
}

function assignPlatforms(categoryTitle, tool) {
  const platforms = new Set(categoryPlatformMap[categoryTitle] ?? ["amazon", "independent-site"])
  const text = `${tool.title} ${tool.desc} ${tool.link}`.toLowerCase()

  if (/amazon/.test(text)) {
    platforms.add("amazon")
  }
  if (/shopify/.test(text)) {
    platforms.add("shopify")
  }
  if (/tiktok/.test(text)) {
    platforms.add("tiktok-shop")
  }
  if (/walmart/.test(text)) {
    platforms.add("walmart")
  }
  if (/独立站|wordpress|seo|shopify|woocommerce|建站/.test(tool.title + tool.desc)) {
    platforms.add("independent-site")
  }

  return [...platforms]
}

function translateCategoryToEnglish(title) {
  const map = {
    "热门平台": "Popular Platforms",
    "常用工具": "Core Tools",
    "平台大全": "Platform Directory",
    "论坛资讯": "Forums & News",
    "跨境服务": "Cross-border Services",
    "培训教程": "Training & Courses",
    "本土货源": "Local Sourcing",
    "AI工具箱": "AI Toolbox",
    "独立站": "Independent Sites",
    "官方专区": "Official Portals",
    "推荐插件": "Recommended Plugins",
    "本土新闻资讯": "Local Market News"
  }

  return map[title] ?? title
}

function translateSummaryToEnglish(summary) {
  if (!summary) {
    return "Useful resource for cross-border teams."
  }

  return `Useful resource for China-based global commerce teams: ${summary}`
}

function inferPricing(tool) {
  const text = `${tool.title} ${tool.desc}`.toLowerCase()

  if (/free|免费/.test(text)) {
    return "free"
  }
  if (/trial|试用/.test(text)) {
    return "freemium"
  }
  if (/saas|erp|服务|平台|工具/.test(text)) {
    return "custom"
  }

  return "unknown"
}

function main() {
  const navData = parseNavData()
  ensureDir(contentRoot)

  const categories = []
  const tools = []
  const categoryTranslationsZh = {}
  const categoryTranslationsEn = {}

  const toolMap = new Map()
  const categoryToolMap = new Map()

  navData.forEach((category, categoryIndex) => {
    const slug = categorySlugMap[category.title] ?? slugify(category.title)
    categoryToolMap.set(slug, [])

    const zhDescription = `围绕${category.title}整理的出海资源入口，帮助中国团队更快筛选可用平台、工具和服务商。`
    const enName = translateCategoryToEnglish(category.title)
    const enDescription = `A curated entry point for ${enName.toLowerCase()} relevant to China-based global commerce teams.`

    categories.push({
      id: `category-${slug}`,
      slug,
      sortOrder: categoryIndex + 1,
      isFeatured: categoryIndex < 6,
      toolSlugs: [],
      marketSlugs: categoryMarketMap[category.title] ?? ["us", "eu"],
      platformSlugs: categoryPlatformMap[category.title] ?? ["amazon", "independent-site"]
    })

    categoryTranslationsZh[slug] = {
      locale: "zh-CN",
      name: category.title,
      shortDescription: zhDescription,
      seoTitle: `${category.title}工具导航 | Silkroads Trade`,
      seoDescription: `${zhDescription} 查看核心工具、服务商与平台入口。`,
      intro: `${category.title} 是 Silkroads Trade 的重点内容分组之一，用来帮助中国出海团队更快做出工具和服务选择。`
    }

    categoryTranslationsEn[slug] = {
      locale: "en",
      name: enName,
      shortDescription: enDescription,
      seoTitle: `${enName} | Silkroads Trade`,
      seoDescription: `${enDescription} Explore tools, services, and platforms in this category.`,
      intro: `${enName} helps global growth teams browse tools and providers in a more structured way.`
    }

    category.items.forEach((item, itemIndex) => {
      const normalizedDomain = normalizeDomain(item.link)
      const baseSlug = slugify(item.title || normalizedDomain)
      const uniqueSlug = toolMap.has(baseSlug) ? `${baseSlug}-${toolMap.size + 1}` : baseSlug
      const existing = [...toolMap.values()].find((toolRecord) => toolRecord.officialUrl === item.link)

      if (existing) {
        if (!existing.categorySlugs.includes(slug)) {
          existing.categorySlugs.push(slug)
        }

        categoryToolMap.get(slug).push(existing.slug)
        return
      }

      const markets = assignMarkets(category.title, item)
      const platforms = assignPlatforms(category.title, item)
      const summaryZh = sanitizeText(item.desc || item.title)
      const summaryEn = translateSummaryToEnglish(summaryZh)

      const toolRecord = {
        id: `tool-${uniqueSlug}`,
        slug: uniqueSlug,
        nameDefault: sanitizeText(item.title),
        officialUrl: item.link,
        normalizedDomain,
        pricingModel: inferPricing(item),
        supportsChinese: true,
        verificationStatus: "seed",
        sourceType: "seed_import",
        publicationStatus: "candidate",
        auditStatus: "unchecked",
        categorySlugs: [slug],
        marketSlugs: markets,
        platformSlugs: platforms,
        isFeatured: itemIndex < 8 || categoryIndex < 2,
        score: Math.max(100 - itemIndex, 10),
        translations: {
          "zh-CN": {
            locale: "zh-CN",
            name: sanitizeText(item.title),
            summary: summaryZh,
            description: `${summaryZh} 该条目来自原始导航数据导入，后续可继续补充适用场景、风险提示和运营建议。`,
            bestFor: `${category.title} 相关场景`,
            notFor: "需要深度评测和复杂对比时，需要继续补充编辑内容。",
            pricingNotes: "价格信息待补充或以官网为准。",
            seoTitle: `${sanitizeText(item.title)} | ${category.title}工具导航`,
            seoDescription: `${summaryZh} 查看官网、分类与相关市场入口。`
          },
          en: {
            locale: "en",
            name: sanitizeText(item.title),
            summary: summaryEn,
            description: `${summaryEn} Imported from the legacy navigation dataset and ready for future editorial enrichment.`,
            bestFor: `${translateCategoryToEnglish(category.title)} workflows`,
            notFor: "Teams that need in-depth comparisons should expect more editorial content later.",
            pricingNotes: "Pricing details should be verified on the official website.",
            seoTitle: `${sanitizeText(item.title)} | ${translateCategoryToEnglish(category.title)}`,
            seoDescription: `${summaryEn} Explore the official site and related category context.`
          }
        }
      }

      toolMap.set(uniqueSlug, toolRecord)
      categoryToolMap.get(slug).push(uniqueSlug)
    })
  })

  const toolsList = [...toolMap.values()]

  const normalizedCategories = categories.map((category) => ({
    ...category,
    toolSlugs: categoryToolMap.get(category.slug)
  }))

  writeJson("categories/index.json", normalizedCategories)
  writeJson("categories/translations/zh-CN.json", categoryTranslationsZh)
  writeJson("categories/translations/en.json", categoryTranslationsEn)
  writeJson("markets/index.json", marketSeeds.map(({ translations, ...market }) => market))
  writeJson(
    "markets/translations/zh-CN.json",
    Object.fromEntries(marketSeeds.map((market) => [market.slug, market.translations["zh-CN"]]))
  )
  writeJson("markets/translations/en.json", Object.fromEntries(marketSeeds.map((market) => [market.slug, market.translations.en])))
  writeJson("platforms/index.json", platformSeeds.map(({ translations, ...platform }) => platform))
  writeJson(
    "platforms/translations/zh-CN.json",
    Object.fromEntries(platformSeeds.map((platform) => [platform.slug, platform.translations["zh-CN"]]))
  )
  writeJson(
    "platforms/translations/en.json",
    Object.fromEntries(platformSeeds.map((platform) => [platform.slug, platform.translations.en]))
  )
  writeJson("guides/index.json", guideSeeds)
  writeJson("ads/placements.json", adPlacements)
  writeJson("ads/items.json", adItems)
  writeJson("tools/index.json", toolsList)

  const report = {
    categories: normalizedCategories.length,
    tools: toolsList.length,
    markets: marketSeeds.length,
    platforms: platformSeeds.length,
    guides: guideSeeds.length
  }

  console.log(JSON.stringify(report, null, 2))
}

main()
