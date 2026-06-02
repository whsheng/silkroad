import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { BackToTopButton } from "@/components/public/back-to-top-button"
import { Locale, getLocaleLabel, isLocale, locales } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { buildMetadata } from "@/lib/seo/metadata"

type LocaleLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  return buildMetadata({
    locale,
    pathname: ""
  })
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const dictionary = getDictionary(locale)

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(186,155,96,0.18),transparent_32%),linear-gradient(180deg,rgba(245,243,236,1)_0%,rgba(250,249,246,1)_65%,rgba(255,255,255,1)_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(168,123,52,0.22),transparent_26%),linear-gradient(180deg,rgba(18,15,12,1)_0%,rgba(16,14,12,1)_60%,rgba(10,10,10,1)_100%)]" />
      <header className="border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 md:px-8">
          <div className="space-y-1">
            <Link href={`/${locale}`} className="font-semibold tracking-[0.18em] text-foreground uppercase">
              Silkroads Trade
            </Link>
            <p className="text-sm text-muted-foreground">{dictionary.header.tagline}</p>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            {locales.map((item) => (
              <LocaleLink key={item} currentLocale={locale} nextLocale={item} />
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <BackToTopButton />
      <footer className="border-t border-border/70 bg-background/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground md:px-8">
          <p>{dictionary.footer.description}</p>
          <p>{dictionary.footer.copyright}</p>
        </div>
      </footer>
    </div>
  )
}

function LocaleLink({
  currentLocale,
  nextLocale
}: {
  currentLocale: Locale
  nextLocale: Locale
}) {
  const isActive = currentLocale === nextLocale

  return (
    <Link
      href={`/${nextLocale}`}
      className={`rounded-full border px-3 py-1.5 transition-colors ${
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
      }`}
      hrefLang={nextLocale}
    >
      {getLocaleLabel(nextLocale)}
    </Link>
  )
}
