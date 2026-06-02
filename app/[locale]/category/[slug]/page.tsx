import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/public/json-ld"
import { LinkTile } from "@/components/public/link-tile"
import { EmptyStateCard } from "@/components/public/empty-state-card"
import { PageShell } from "@/components/public/page-shell"
import { SectionHeading } from "@/components/public/section-heading"
import { ToolGrid } from "@/components/public/tool-grid"
import { AdBanner } from "@/components/public/ad-banner"
import { getCategories, getCategoryBySlug, getMarkets, getPlatforms, getToolsBySlugs, getAdsForPlacement } from "@/lib/content/loaders"
import { isLocale, locales, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildFaqJsonLd } from "@/lib/seo/json-ld"
import { buildMetadata } from "@/lib/seo/metadata"

type CategoryPageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    getCategories(locale).map((category) => ({
      locale,
      slug: category.slug
    }))
  )
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const category = getCategoryBySlug(locale, slug)

  if (!category) {
    return {}
  }

  return buildMetadata({
    locale,
    pathname: `/category/${slug}`,
    title: category.translation.seoTitle,
    description: category.translation.seoDescription
  })
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const category = getCategoryBySlug(locale, slug)

  if (!category) {
    notFound()
  }

  const dictionary = getDictionary(locale)
  const tools = getToolsBySlugs(locale, category.toolSlugs)
  const markets = getMarkets(locale).filter((market) => category.marketSlugs.includes(market.slug))
  const platforms = getPlatforms(locale).filter((platform) => category.platformSlugs.includes(platform.slug))
  const topAds = getAdsForPlacement(locale, "category_top_banner", "category", category.slug)
  const faqItems = [
    {
      question: locale === "zh-CN" ? "这个分类适合谁？" : "Who is this category for?",
      answer:
        locale === "zh-CN"
          ? `适合正在筛选${category.translation.name}相关工具、服务商和站点入口的中国出海团队。`
          : `Useful for teams evaluating ${category.translation.name.toLowerCase()} tools, services, and resource sites.`
    },
    {
      question: locale === "zh-CN" ? "怎么使用这页？" : "How should this page be used?",
      answer:
        locale === "zh-CN"
          ? "先查看工具列表，再结合推荐市场和推荐平台页，缩小你的选择范围。"
          : "Start with the tool list, then use the related market and platform links to narrow the decision set."
    },
    {
      question: locale === "zh-CN" ? "信息是否完整？" : "Is the information complete?",
      answer:
        locale === "zh-CN"
          ? "我们会持续补充价格、适用场景、服务特点与使用提示，帮助你更快完成判断。"
          : "We continue to expand pricing notes, fit, service traits, and usage guidance to support faster decisions."
    }
  ]

  return (
    <PageShell
      locale={locale}
      dictionary={dictionary}
      breadcrumbs={[
        { label: dictionary.header.home, href: `/${locale}` },
        { label: category.translation.name }
      ]}
    >
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: dictionary.header.home, path: `/${locale}` },
          { name: category.translation.name, path: `/${locale}/category/${category.slug}` }
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd(
          category.translation.name,
          category.translation.seoDescription,
          `/${locale}/category/${category.slug}`
        )}
      />
      <JsonLd data={buildFaqJsonLd(faqItems)} />

      <section className="space-y-5 rounded-[2rem] border border-border/70 bg-white/85 p-8 dark:bg-card/65">
        <SectionHeading
          eyebrow={dictionary.category.pageIntro}
          title={category.translation.name}
          description={category.translation.intro}
        />
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="rounded-full border border-border bg-secondary/40 px-3 py-1.5">
            {dictionary.category.toolCount}: {tools.length}
          </span>
        </div>
      </section>

      {topAds[0] ? <AdBanner locale={locale} item={topAds[0]} /> : null}

      <section className="space-y-6">
        <SectionHeading title={dictionary.common.tools} description={category.translation.shortDescription} />
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
        <div className="space-y-5">
          <SectionHeading title={dictionary.category.relatedMarkets} />
          <div className="grid gap-4">
            {markets.map((market) => (
              <LinkTile
                key={market.slug}
                title={market.translation.name}
                description={market.translation.shortDescription}
                href={`/${locale}/market/${market.slug}`}
              />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <SectionHeading title={dictionary.category.relatedPlatforms} />
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

      <section className="rounded-[2rem] border border-border/70 bg-white/85 p-8 dark:bg-card/65">
        <SectionHeading title={dictionary.category.faqTitle} />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border/70 bg-background/60 p-5">
            <h3 className="font-semibold text-foreground">{faqItems[0].question}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{faqItems[0].answer}</p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-background/60 p-5">
            <h3 className="font-semibold text-foreground">{faqItems[1].question}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{faqItems[1].answer}</p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-background/60 p-5">
            <h3 className="font-semibold text-foreground">{faqItems[2].question}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{faqItems[2].answer}</p>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
