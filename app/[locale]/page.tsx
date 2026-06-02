import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Compass, Globe2, Layers, Rocket, Star } from "lucide-react"
import { notFound } from "next/navigation"

import { AdBanner } from "@/components/public/ad-banner"
import { EmptyStateCard } from "@/components/public/empty-state-card"
import { JsonLd } from "@/components/public/json-ld"
import { LinkTile } from "@/components/public/link-tile"
import { PageShell } from "@/components/public/page-shell"
import { SectionHeading } from "@/components/public/section-heading"
import { StatCard } from "@/components/public/stat-card"
import { ToolGrid } from "@/components/public/tool-grid"
import {
  getAdsForPlacement,
  getCategories,
  getFeaturedTools,
  getGuides,
  getMarkets,
  getPlatforms,
  getPublishedToolSlugSet,
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
  const publishedToolSlugSet = getPublishedToolSlugSet()
  const heroAds = getAdsForPlacement(locale, "home_hero_banner", "home", null)
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

      {heroAds[0] ? <AdBanner locale={locale} item={heroAds[0]} /> : null}

      <section className="grid gap-6 rounded-[2rem] border border-border/70 bg-white/85 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-card/65 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <SectionHeading
            eyebrow={locale === "zh-CN" ? "使用说明" : "How to use"}
            title={dictionary.home.audienceTitle}
            description={dictionary.home.audienceDescription}
          />
          <div className="rounded-3xl border border-border/70 bg-background/60 p-5">
            <div className="flex items-center gap-3">
              <Compass className="h-5 w-5 text-amber-700" />
              <h3 className="text-lg font-semibold text-foreground">{dictionary.home.entryTitle}</h3>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{dictionary.home.entryDescription}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <LinkTile
            title={dictionary.home.entryModes.categories.title}
            description={dictionary.home.entryModes.categories.description}
            href={`/${locale}/category/${categories[0]?.slug ?? ""}`}
            meta={dictionary.common.categories}
          />
          <LinkTile
            title={dictionary.home.entryModes.markets.title}
            description={dictionary.home.entryModes.markets.description}
            href={`/${locale}/market/${markets[0]?.slug ?? ""}`}
            meta={dictionary.common.markets}
          />
          <LinkTile
            title={dictionary.home.entryModes.platforms.title}
            description={dictionary.home.entryModes.platforms.description}
            href={`/${locale}/platform/${platforms[0]?.slug ?? ""}`}
            meta={dictionary.common.platforms}
          />
          <LinkTile
            title={dictionary.home.entryModes.guides.title}
            description={dictionary.home.entryModes.guides.description}
            href={guides[0] ? `/${locale}/guide/${guides[0].slug}` : `/${locale}/submit`}
            meta={dictionary.common.guides}
          />
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          title={dictionary.home.featuredCategories}
          description={
            locale === "zh-CN"
              ? "围绕选品、建站、物流、支付、合规与增长等关键环节，帮助团队快速进入对应资源版块。"
              : "Structured around sourcing, storefronts, logistics, payments, compliance, and growth so teams can reach the right resources faster."
          }
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {categories.slice(0, 6).map((category) => (
            <LinkTile
              key={category.slug}
              title={category.translation.name}
              description={category.translation.shortDescription}
              href={`/${locale}/category/${category.slug}`}
              meta={`${category.toolSlugs.filter((slug) => publishedToolSlugSet.has(slug)).length} ${dictionary.common.tools}`}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading title={dictionary.home.featuredTools} description={locale === "zh-CN" ? "精选一批高频入口，帮助用户快速发现真实可用的站点和服务商。" : "A curated set of high-frequency resources to help teams discover practical tools faster."} />
        {tools.length > 0 ? (
          <ToolGrid locale={locale} tools={tools} />
        ) : (
          <EmptyStateCard
            title={dictionary.common.emptyToolsTitle}
            description={dictionary.common.emptyToolsDescription}
            ctaLabel={dictionary.common.submitSite}
            ctaHref={`/${locale}/submit`}
          />
        )}
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <SectionHeading
            title={dictionary.home.featuredMarkets}
            description={
              locale === "zh-CN"
                ? "聚焦重点出海市场，梳理不同区域在平台、物流、支付与合规上的关键差异。"
                : "Focused market pages highlight the practical differences across platforms, logistics, payments, and compliance in each region."
            }
          />
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
          <SectionHeading
            title={dictionary.home.featuredPlatforms}
            description={
              locale === "zh-CN"
                ? "覆盖 Amazon、Shopify、TikTok Shop 与独立站等核心渠道，方便按平台场景筛选工具与服务商。"
                : "Covering Amazon, Shopify, TikTok Shop, and owned channels so teams can evaluate tools and service partners by platform context."
            }
          />
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
        <SectionHeading
          title={dictionary.home.featuredGuides}
          description={
            locale === "zh-CN"
              ? "精选专题帮助团队快速理解重点市场、平台打法与常见运营问题。"
              : "Editorial guides help teams quickly understand key markets, platform playbooks, and common operational questions."
          }
        />
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
          <h3 className="text-lg font-semibold text-foreground">{locale === "zh-CN" ? "清晰分类" : "Clear structure"}</h3>
          <p className="text-sm leading-7 text-muted-foreground">
            {locale === "zh-CN"
              ? "通过分类、市场、平台与专题的组合导航，帮助团队更快缩小选择范围。"
              : "Categories, markets, platforms, and guides work together to narrow choices faster for each workflow."}
          </p>
        </div>
        <div className="space-y-3">
          <Rocket className="h-5 w-5 text-amber-700" />
          <h3 className="text-lg font-semibold text-foreground">{locale === "zh-CN" ? "稳定访问" : "Reliable access"}</h3>
          <p className="text-sm leading-7 text-muted-foreground">
            {locale === "zh-CN"
              ? "页面加载轻量、访问直接，适合高频查询和长期使用场景。"
              : "Fast page delivery and lightweight rendering make the site reliable for frequent lookup and repeated use."}
          </p>
        </div>
        <div className="space-y-3">
          <Star className="h-5 w-5 text-amber-700" />
          <h3 className="text-lg font-semibold text-foreground">{locale === "zh-CN" ? "持续更新" : "Continuously updated"}</h3>
          <p className="text-sm leading-7 text-muted-foreground">
            {locale === "zh-CN"
              ? "站点内容会持续补充与校正，保持对出海团队更有参考价值。"
              : "Content is continuously expanded and refined to stay useful for China-based global growth teams."}
          </p>
        </div>
      </section>
    </PageShell>
  )
}
