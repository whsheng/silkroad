import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/public/page-shell"
import { SectionHeading } from "@/components/public/section-heading"
import { SubmitForm } from "@/components/public/submit-form"
import { getCategories, getMarkets, getPlatforms } from "@/lib/content/loaders"
import { isLocale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { buildMetadata } from "@/lib/seo/metadata"

type SubmitPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: SubmitPageProps): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const dictionary = getDictionary(locale)

  return buildMetadata({
    locale,
    pathname: "/submit",
    title: dictionary.submit.title,
    description: dictionary.submit.description
  })
}

export default async function SubmitPage({ params }: SubmitPageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const dictionary = getDictionary(locale)
  const categories = getCategories(locale).map((category) => ({
    slug: category.slug,
    label: category.translation.name
  }))
  const markets = getMarkets(locale).map((market) => ({
    slug: market.slug,
    label: market.translation.name
  }))
  const platforms = getPlatforms(locale).map((platform) => ({
    slug: platform.slug,
    label: platform.translation.name
  }))

  return (
    <PageShell
      locale={locale}
      dictionary={dictionary}
      breadcrumbs={[
        { label: dictionary.header.home, href: `/${locale}` },
        { label: dictionary.header.submit }
      ]}
    >
      <section className="space-y-8 rounded-[2rem] border border-border/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] dark:bg-card/65">
        <SectionHeading title={dictionary.submit.title} description={dictionary.submit.description} />
        <SubmitForm
          locale={locale}
          copy={dictionary.submit}
          categories={categories}
          markets={markets}
          platforms={platforms}
        />
      </section>

      <section className="space-y-3 rounded-[2rem] border border-border/70 bg-white/85 p-8 dark:bg-card/65">
        <h2 className="text-lg font-semibold text-foreground">{dictionary.submit.processTitle}</h2>
        <ol className="space-y-2 text-sm leading-7 text-muted-foreground">
          {dictionary.submit.process.map((item, index) => (
            <li key={index}>
              {index + 1}. {item}
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  )
}
