import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/public/json-ld"
import { LinkTile } from "@/components/public/link-tile"
import { PageShell } from "@/components/public/page-shell"
import { SectionHeading } from "@/components/public/section-heading"
import { getCategories, getGuideBySlug, getGuides, getMarkets, getPlatforms } from "@/lib/content/loaders"
import { isLocale, locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/lib/seo/json-ld"
import { buildMetadata } from "@/lib/seo/metadata"

type GuidePageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    getGuides(locale).map((guide) => ({
      locale,
      slug: guide.slug
    }))
  )
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const guide = getGuideBySlug(locale, slug)

  if (!guide) {
    return {}
  }

  return buildMetadata({
    locale,
    pathname: `/guide/${slug}`,
    title: guide.translation.seoTitle,
    description: guide.translation.seoDescription
  })
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const guide = getGuideBySlug(locale, slug)

  if (!guide) {
    notFound()
  }

  const dictionary = getDictionary(locale)
  const relatedCategories = getCategories(locale).filter((category) => guide.featuredCategorySlugs.includes(category.slug))
  const relatedMarkets = getMarkets(locale).filter((market) => guide.featuredMarketSlugs.includes(market.slug))
  const relatedPlatforms = getPlatforms(locale).filter((platform) => guide.featuredPlatformSlugs.includes(platform.slug))

  return (
    <PageShell
      locale={locale}
      dictionary={dictionary}
      breadcrumbs={[
        { label: dictionary.header.home, href: `/${locale}` },
        { label: guide.translation.title }
      ]}
    >
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: dictionary.header.home, path: `/${locale}` },
          { name: guide.translation.title, path: `/${locale}/guide/${guide.slug}` }
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd(
          guide.translation.title,
          guide.translation.seoDescription,
          `/${locale}/guide/${guide.slug}`
        )}
      />

      <article className="space-y-8 rounded-[2rem] border border-border/70 bg-white/85 p-8 dark:bg-card/65">
        <SectionHeading eyebrow={dictionary.guide.overview} title={guide.translation.title} description={guide.translation.summary} />
        <div className="space-y-4">
          {guide.translation.content.map((paragraph, index) => (
            <p key={index} className="text-base leading-8 text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      <section className="space-y-6">
        <SectionHeading title={dictionary.guide.relatedLinks} />
        <div className="grid gap-5 lg:grid-cols-3">
          {relatedCategories.map((category) => (
            <LinkTile
              key={category.slug}
              title={category.translation.name}
              description={category.translation.shortDescription}
              href={`/${locale}/category/${category.slug}`}
            />
          ))}
          {relatedMarkets.map((market) => (
            <LinkTile
              key={market.slug}
              title={market.translation.name}
              description={market.translation.shortDescription}
              href={`/${locale}/market/${market.slug}`}
            />
          ))}
          {relatedPlatforms.map((platform) => (
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
