import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/public/json-ld"
import { LinkTile } from "@/components/public/link-tile"
import { PageShell } from "@/components/public/page-shell"
import { SectionHeading } from "@/components/public/section-heading"
import { ToolGrid } from "@/components/public/tool-grid"
import { getCategories, getMarketBySlug, getMarkets, getPlatforms, getTools } from "@/lib/content/loaders"
import { isLocale, locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/lib/seo/json-ld"
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
        <ToolGrid locale={locale} tools={tools} />
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
    </PageShell>
  )
}
