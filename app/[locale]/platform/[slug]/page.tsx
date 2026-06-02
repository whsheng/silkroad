import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/public/json-ld"
import { LinkTile } from "@/components/public/link-tile"
import { EmptyStateCard } from "@/components/public/empty-state-card"
import { PageShell } from "@/components/public/page-shell"
import { SectionHeading } from "@/components/public/section-heading"
import { ToolGrid } from "@/components/public/tool-grid"
import { getCategories, getMarkets, getPlatformBySlug, getPlatforms, getTools } from "@/lib/content/loaders"
import { isLocale, locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildFaqJsonLd } from "@/lib/seo/json-ld"
import { buildMetadata } from "@/lib/seo/metadata"

type PlatformPageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    getPlatforms(locale).map((platform) => ({
      locale,
      slug: platform.slug
    }))
  )
}

export async function generateMetadata({ params }: PlatformPageProps): Promise<Metadata> {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const platform = getPlatformBySlug(locale, slug)

  if (!platform) {
    return {}
  }

  return buildMetadata({
    locale,
    pathname: `/platform/${slug}`,
    title: platform.translation.seoTitle,
    description: platform.translation.seoDescription
  })
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const platform = getPlatformBySlug(locale, slug)

  if (!platform) {
    notFound()
  }

  const dictionary = getDictionary(locale)
  const categories = getCategories(locale).filter(
    (category) => platform.featuredCategorySlugs.includes(category.slug) || category.platformSlugs.includes(platform.slug)
  )
  const markets = getMarkets(locale).filter(
    (market) => platform.featuredMarketSlugs.includes(market.slug) || market.featuredPlatformSlugs.includes(platform.slug)
  )
  const tools = getTools(locale).filter((tool) => tool.platformSlugs.includes(platform.slug)).slice(0, 36)
  const faqItems = [
    {
      question: locale === "zh-CN" ? `${platform.translation.name}页面适合谁看？` : `Who should use the ${platform.translation.name} page?`,
      answer:
        locale === "zh-CN"
          ? `适合已经确定重点做${platform.translation.name}，正在筛选配套工具、服务商与目标市场的团队。`
          : `Useful for teams already prioritizing ${platform.translation.name} and evaluating the supporting tool and market stack.`
    },
    {
      question: locale === "zh-CN" ? "先筛工具还是先筛市场？" : "Should teams start with tools or markets first?",
      answer:
        locale === "zh-CN"
          ? "如果平台打法差异更大，先看平台页；如果区域差异更大，再结合市场页判断本地化和履约要求。"
          : "Start with the platform page when channel mechanics matter most, then use market pages when regional localization and fulfilment differences drive the decision."
    },
    {
      question: locale === "zh-CN" ? "这页内容会持续更新吗？" : "Will this page keep evolving?",
      answer:
        locale === "zh-CN"
          ? "会，平台页会持续补充更适合该平台的分类入口、工具集合和运营判断信息。"
          : "Yes. Platform pages will continue to expand with better category paths, tool sets, and operating guidance tied to that channel."
    }
  ]

  return (
    <PageShell
      locale={locale}
      dictionary={dictionary}
      breadcrumbs={[
        { label: dictionary.header.home, href: `/${locale}` },
        { label: platform.translation.name }
      ]}
    >
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: dictionary.header.home, path: `/${locale}` },
          { name: platform.translation.name, path: `/${locale}/platform/${platform.slug}` }
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd(
          platform.translation.name,
          platform.translation.seoDescription,
          `/${locale}/platform/${platform.slug}`
        )}
      />
      <JsonLd data={buildFaqJsonLd(faqItems)} />

      <section className="space-y-5 rounded-[2rem] border border-border/70 bg-white/85 p-8 dark:bg-card/65">
        <SectionHeading eyebrow={dictionary.platform.pageIntro} title={platform.translation.name} description={platform.translation.intro} />
      </section>

      <section className="space-y-6">
        <SectionHeading title={dictionary.platform.recommendedCategories} />
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
        <SectionHeading title={dictionary.common.tools} description={platform.translation.shortDescription} />
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
        <SectionHeading title={dictionary.common.markets} />
        <div className="grid gap-5 lg:grid-cols-3">
          {markets.map((market) => (
            <LinkTile
              key={market.slug}
              title={market.translation.name}
              description={market.translation.shortDescription}
              href={`/${locale}/market/${market.slug}`}
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
