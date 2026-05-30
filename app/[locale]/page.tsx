import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Globe2, Layers, Rocket, Star } from "lucide-react"
import { notFound } from "next/navigation"

import { AdBanner } from "@/components/public/ad-banner"
import { JsonLd } from "@/components/public/json-ld"
import { LinkTile } from "@/components/public/link-tile"
import { PageShell } from "@/components/public/page-shell"
import { SectionHeading } from "@/components/public/section-heading"
import { StatCard } from "@/components/public/stat-card"
import { ToolGrid } from "@/components/public/tool-grid"
import {
  getAds,
  getCategories,
  getFeaturedTools,
  getGuides,
  getMarkets,
  getPlatforms,
  getStats
} from "@/lib/content/loaders"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { buildCollectionPageJsonLd, buildWebsiteJsonLd } from "@/lib/seo/json-ld"
import { buildMetadata } from "@/lib/seo/metadata"
import { siteDescription, siteName } from "@/lib/seo/site"

type HomePageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  return buildMetadata({
    locale,
    pathname: ""
  })
}

export default async function LocaleHomePage({ params }: HomePageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  return <HomeContent locale={locale} />
}

function HomeContent({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale)
  const categories = getCategories(locale)
  const markets = getMarkets(locale)
  const platforms = getPlatforms(locale)
  const guides = getGuides(locale)
  const tools = getFeaturedTools(locale, 9)
  const ads = getAds(locale, "home", null)
  const stats = getStats()

  return (
    <PageShell locale={locale} dictionary={dictionary} breadcrumbs={[{ label: dictionary.header.home }]}>
      <JsonLd data={buildWebsiteJsonLd(siteName[locale], siteDescription[locale])} />
      <JsonLd data={buildCollectionPageJsonLd(siteName[locale], siteDescription[locale], `/${locale}`)} />

      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6 rounded-[2rem] border border-border/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.07)] dark:bg-card/65">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700/80">{dictionary.home.eyebrow}</p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {dictionary.home.title}
          </h1>
          <p className="max-w-3xl text-base leading-8 text-muted-foreground">{dictionary.home.description}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/category/${categories[0]?.slug ?? ""}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
            >
              <span>{dictionary.home.primaryCta}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            {guides[0] ? (
              <Link
                href={`/${locale}/guide/${guides[0].slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium"
              >
                <span>{dictionary.home.secondaryCta}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <StatCard label={dictionary.common.stats.categories} value={String(stats.categoryCount)} />
          <StatCard label={dictionary.common.stats.tools} value={String(stats.toolCount)} />
          <StatCard label={dictionary.common.stats.markets} value={String(stats.marketCount)} />
          <StatCard label={dictionary.common.stats.platforms} value={String(stats.platformCount)} />
        </div>
      </section>

      {ads[0] ? <AdBanner locale={locale} item={ads[0]} /> : null}

      <section className="space-y-6">
        <SectionHeading
          title={dictionary.home.featuredCategories}
          description={locale === "zh-CN" ? "从核心分类快速切入，优先建设最有 SEO 价值的分类入口。" : "Start with the strongest category entry points for search visibility and decision speed."}
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {categories.slice(0, 6).map((category) => (
            <LinkTile
              key={category.slug}
              title={category.translation.name}
              description={category.translation.shortDescription}
              href={`/${locale}/category/${category.slug}`}
              meta={`${category.toolSlugs.length} ${dictionary.common.tools}`}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading title={dictionary.home.featuredTools} description={locale === "zh-CN" ? "精选一批高频入口，帮助用户快速发现真实可用的站点和服务商。" : "A curated set of high-frequency resources to help teams discover practical tools faster."} />
        <ToolGrid locale={locale} tools={tools} />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <SectionHeading title={dictionary.home.featuredMarkets} description={locale === "zh-CN" ? "市场页用于承接地域相关搜索，帮助用户按区域理解工具与服务差异。" : "Market pages capture geography-led search intent and explain regional workflow differences."} />
          <div className="grid gap-4">
            {markets.map((market) => (
              <LinkTile
                key={market.slug}
                title={market.translation.name}
                description={market.translation.shortDescription}
                href={`/${locale}/market/${market.slug}`}
                meta={
                  <span className="inline-flex items-center gap-2">
                    <Globe2 className="h-3.5 w-3.5" />
                    <span>{dictionary.common.markets}</span>
                  </span>
                }
              />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <SectionHeading title={dictionary.home.featuredPlatforms} description={locale === "zh-CN" ? "平台页负责沉淀 Amazon、Shopify、TikTok Shop 和独立站这类高意图入口。" : "Platform pages consolidate high-intent journeys across Amazon, Shopify, TikTok Shop, and owned channels."} />
          <div className="grid gap-4">
            {platforms.map((platform) => (
              <LinkTile
                key={platform.slug}
                title={platform.translation.name}
                description={platform.translation.shortDescription}
                href={`/${locale}/platform/${platform.slug}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading title={dictionary.home.featuredGuides} description={locale === "zh-CN" ? "专题页负责承接更长尾的内容搜索需求，也是后续 SEO 增长的核心资产。" : "Guides handle longer-tail intent and become a core SEO growth asset over time."} />
        <div className="grid gap-5 lg:grid-cols-2">
          {guides.map((guide) => (
            <LinkTile
              key={guide.slug}
              title={guide.translation.title}
              description={guide.translation.summary}
              href={`/${locale}/guide/${guide.slug}`}
              meta={guide.updatedAt}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/70 bg-white/85 p-8 dark:bg-card/65">
        <SectionHeading title={dictionary.home.submissionTitle} description={dictionary.home.submissionDescription} />
        <div className="mt-5">
          <Link
            href={`/${locale}/submit`}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium"
          >
            <span>{dictionary.home.submissionCta}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-5 rounded-[2rem] border border-border/70 bg-white/85 p-8 dark:bg-card/65 md:grid-cols-3">
        <div className="space-y-3">
          <Layers className="h-5 w-5 text-amber-700" />
          <h3 className="text-lg font-semibold text-foreground">{locale === "zh-CN" ? "分类页优先" : "Category-first information architecture"}</h3>
          <p className="text-sm leading-7 text-muted-foreground">
            {locale === "zh-CN"
              ? "避免继续堆单个超长首页，把 SEO 权重和内容组织拆到分类、市场、平台和专题页。"
              : "Avoid a single endless homepage and distribute search value across categories, markets, platforms, and guides."}
          </p>
        </div>
        <div className="space-y-3">
          <Rocket className="h-5 w-5 text-amber-700" />
          <h3 className="text-lg font-semibold text-foreground">{locale === "zh-CN" ? "静态化部署" : "Static-first publishing"}</h3>
          <p className="text-sm leading-7 text-muted-foreground">
            {locale === "zh-CN"
              ? "内容由 Git 驱动，构建期生成静态页面，适合 Vercel 免费环境和长期性能稳定。"
              : "Content is Git-driven and turned into static pages during build, which keeps the free Vercel deployment lean and reliable."}
          </p>
        </div>
        <div className="space-y-3">
          <Star className="h-5 w-5 text-amber-700" />
          <h3 className="text-lg font-semibold text-foreground">{locale === "zh-CN" ? "可持续扩展" : "Built for expansion"}</h3>
          <p className="text-sm leading-7 text-muted-foreground">
            {locale === "zh-CN"
              ? "二期再接投稿审核、广告位和运营后台，一期先把结构、SEO 和加载速度打牢。"
              : "Phase 2 can add submissions, review, and sponsor operations once the content model and SEO foundation are solid."}
          </p>
        </div>
      </section>
    </PageShell>
  )
}
