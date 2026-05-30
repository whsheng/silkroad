import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/public/json-ld"
import { LinkTile } from "@/components/public/link-tile"
import { PageShell } from "@/components/public/page-shell"
import { SectionHeading } from "@/components/public/section-heading"
import { ToolGrid } from "@/components/public/tool-grid"
import { getCategories, getMarkets, getPlatformBySlug, getPlatforms, getTools } from "@/lib/content/loaders"
import { isLocale, locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/lib/seo/json-ld"
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
        <ToolGrid locale={locale} tools={tools} />
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
    </PageShell>
  )
}
