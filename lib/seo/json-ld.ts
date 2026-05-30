import { siteUrl } from "@/lib/seo/site"

type BreadcrumbItem = {
  name: string
  path: string
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`
    }))
  }
}

export function buildWebsiteJsonLd(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url: siteUrl
  }
}

export function buildCollectionPageJsonLd(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${siteUrl}${path}`
  }
}

export function buildArticleJsonLd({
  title,
  description,
  path,
  publishedAt,
  updatedAt,
  locale,
  articleBody
}: {
  title: string
  description: string
  path: string
  publishedAt: string
  updatedAt: string
  locale: string
  articleBody: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${siteUrl}${path}`,
    inLanguage: locale,
    datePublished: publishedAt,
    dateModified: updatedAt,
    articleBody,
    mainEntityOfPage: `${siteUrl}${path}`,
    publisher: {
      "@type": "Organization",
      name: "Silkroads Trade",
      url: siteUrl
    }
  }
}

export function buildFaqJsonLd(
  items: Array<{
    question: string
    answer: string
  }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  }
}
