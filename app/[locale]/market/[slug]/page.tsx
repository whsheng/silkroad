import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/public/json-ld"
import { LinkTile } from "@/components/public/link-tile"
import { EmptyStateCard } from "@/components/public/empty-state-card"
import { PageShell } from "@/components/public/page-shell"
import { SectionHeading } from "@/components/public/section-heading"
import { ToolGrid } from "@/components/public/tool-grid"
import { getCategories, getMarketBySlug, getMarkets, getPlatforms, getTools } from "@/lib/content/loaders"
import { isLocale, locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildFaqJsonLd } from "@/lib/seo/json-ld"
import { buildMetadata } from "@/lib/seo/metadata"

type MarketPageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    getMarkets(locale).map((market) => ({
      locale,
      slug: market.slug
    }))
  )
}

export async function generateMetadata({ params }: MarketPageProps): Promise<Metadata> {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const market = getMarketBySlug(locale, slug)

  if (!market) {
    return {}
  }

  return buildMetadata({
    locale,
    pathname: `/market/${slug}`,
    title: market.translation.seoTitle,
    description: market.translation.seoDescription
  })
}

export default async function MarketPage({ params }: MarketPageProps) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const market = getMarketBySlug(locale, slug)

  if (!market) {
    notFound()
  }

  const dictionary = getDictionary(locale)
  const categories = getCategories(locale).filter(
    (category) => market.featuredCategorySlugs.includes(category.slug) || category.marketSlugs.includes(market.slug)
  )
  const platforms = getPlatforms(locale).filter(
    (platform) => market.featuredPlatformSlugs.includes(platform.slug) || platform.featuredMarketSlugs.includes(market.slug)
  )
  const tools = getTools(locale).filter((tool) => tool.marketSlugs.includes(market.slug)).slice(0, 36)
  const faqItems = [
    {
      question: locale === "zh-CN" ? `${market.translation.name}更适合哪些团队？` : `Who is ${market.translation.name} most relevant for?`,
      answer:
        locale === "zh-CN"
          ? `适合正在评估${market.translation.name}进入策略、履约方式、支付体验和本地化要求的中国出海团队。`
          : `Useful for teams assessing market entry, fulfilment, payment fit, and localization requirements for ${market.translation.name}.`
    },
    {
      question: locale === "zh-CN" ? "进入这个市场先看什么？" : "What should be checked first for this market?",
      answer:
        locale === "zh-CN"
          ? "先看该市场对应的平台、履约、支付和合规差异，再决定是优先上平台还是优先做独立站。"
          : "Start with the platform mix, fulfilment constraints, payment expectations, and compliance differences before choosing the operating channel."
    },
    {
      question: locale === "zh-CN" ? "这页怎么配合其他页面一起用？" : "How should this page be used with the rest of the site?",
      answer:
        locale === "zh-CN"
          ? "先用市场页理解区域差异，再回到分类页和平台页筛工具，会更容易缩小决策范围。"
          : "Use the market page to understand regional differences, then move into category and platform pages to narrow the decision set."
    }
  ]

  return (
    <PageShell
      locale={locale}
      dictionary={dictionary}
      breadcrumbs={[
        { label: dictionary.header.home, href: `/${locale}` },
        { label: market.translation.name }
      ]}
    >
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: dictionary.header.home, path: `/${locale}` },
          { name: market.translation.name, path: `/${locale}/market/${market.slug}` }
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd(
          market.translation.name,
          market.translation.seoDescription,
          `/${locale}/market/${market.slug}`
        )}
      />
      <JsonLd data={buildFaqJsonLd(faqItems)} />

      <section className="space-y-5 rounded-[2rem] border border-border/70 bg-white/85 p-8 dark:bg-card/65">
        <SectionHeading eyebrow={dictionary.market.pageIntro} title={market.translation.name} description={market.translation.intro} />
      </section>

      <section className="space-y-6">
        <SectionHeading title={dictionary.market.recommendedCategories} />
        <div className="grid gap-5 lg:grid-cols-3">
          {categories.map((category) => (
            <LinkTile
              key={category.slug}
              title={category.translation.name}
              description={category.translation.shortDescription}
              href={`/${locale}/category/${category.slug}`}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading title={dictionary.common.tools} description={market.translation.shortDescription} />
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

      <section className="space-y-6">
        <SectionHeading title={dictionary.common.platforms} />
        <div className="grid gap-5 lg:grid-cols-3">
          {platforms.map((platform) => (
            <LinkTile
              key={platform.slug}
              title={platform.translation.name}
              description={platform.translation.shortDescription}
              href={`/${locale}/platform/${platform.slug}`}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/70 bg-white/85 p-8 dark:bg-card/65">
        <SectionHeading title={locale === "zh-CN" ? "常见问题" : "FAQ"} />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {faqItems.map((item) => (
            <div key={item.question} className="rounded-3xl border border-border/70 bg-background/60 p-5">
              <h3 className="font-semibold text-foreground">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
