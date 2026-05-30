import "server-only"

import { defaultLocale, getLocaleLabel, isLocale, type Locale } from "@/lib/i18n/config"
import { getCategories, getMarkets, getPlatforms, getTools } from "@/lib/content/loaders"

import type { SubmissionPayload } from "@/lib/submissions/types"

type ValidationResult =
  | {
      ok: true
      data: NormalizedSubmission
    }
  | {
      ok: false
      code: "invalid_payload" | "spam_detected"
      fieldErrors: string[]
    }

type GitHubIssueResult =
  | {
      ok: true
      issueNumber: number
      issueUrl: string
    }
  | {
      ok: false
      code: "not_configured" | "github_failed"
    }

type ExistingToolMatch = {
  name: string
  officialUrl: string
  slug: string
}

type NormalizedSubmission = {
  locale: Locale
  siteName: string
  siteUrl: string
  normalizedDomain: string
  description: string
  categorySlugs: string[]
  marketSlugs: string[]
  platformSlugs: string[]
  contactName: string
  contactDetails: string
  notes: string
  turnstileToken: string
}

const GITHUB_API_VERSION = "2022-11-28"
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

type TurnstileVerificationResult =
  | {
      ok: true
    }
  | {
      ok: false
      code: "turnstile_required" | "turnstile_failed"
    }

function sanitizeInline(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : ""
}

function sanitizeMultiline(value: unknown) {
  return typeof value === "string" ? value.replace(/\r\n/g, "\n").replace(/\u0000/g, "").trim() : ""
}

function normalizeSelection(value: unknown) {
  const values = Array.isArray(value) ? value : typeof value === "string" ? [value] : []

  return [...new Set(values.map((item) => sanitizeInline(item)).filter(Boolean))]
}

function normalizeWebsiteUrl(value: string) {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`

  try {
    const url = new URL(candidate)

    if (!["http:", "https:"].includes(url.protocol)) {
      return null
    }

    const normalizedDomain = url.hostname.replace(/^www\./i, "").toLowerCase()
    const normalizedPath = url.pathname.replace(/\/+$/g, "")
    const siteUrl = `${url.protocol}//${normalizedDomain}${normalizedPath}${url.search}` || candidate

    return {
      siteUrl: normalizedPath || url.search ? siteUrl : `${url.protocol}//${normalizedDomain}`,
      normalizedDomain
    }
  } catch {
    return null
  }
}

function validateSelections(label: string, selections: string[], availableSlugs: Set<string>, fieldErrors: string[]) {
  const hasUnknownSelection = selections.some((slug) => !availableSlugs.has(slug))

  if (hasUnknownSelection) {
    fieldErrors.push(label)
  }
}

export function validateSubmissionPayload(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      code: "invalid_payload",
      fieldErrors: ["payload"]
    }
  }

  const source = payload as Partial<SubmissionPayload>
  const localeValue = typeof source.locale === "string" ? source.locale : ""
  const locale = isLocale(localeValue) ? localeValue : null
  const siteName = sanitizeInline(source.siteName)
  const rawSiteUrl = sanitizeInline(source.siteUrl)
  const description = sanitizeMultiline(source.description)
  const contactName = sanitizeInline(source.contactName)
  const contactDetails = sanitizeInline(source.contactDetails)
  const notes = sanitizeMultiline(source.notes)
  const company = sanitizeInline(source.company)
  const turnstileToken = sanitizeInline(source.turnstileToken)
  const categorySlugs = normalizeSelection(source.categorySlugs)
  const marketSlugs = normalizeSelection(source.marketSlugs)
  const platformSlugs = normalizeSelection(source.platformSlugs)
  const fieldErrors: string[] = []

  if (company) {
    return {
      ok: false,
      code: "spam_detected",
      fieldErrors: ["company"]
    }
  }

  if (!locale) {
    fieldErrors.push("locale")
  }

  if (siteName.length < 2 || siteName.length > 80) {
    fieldErrors.push("siteName")
  }

  if (description.length < 20 || description.length > 1200) {
    fieldErrors.push("description")
  }

  if (contactName.length < 2 || contactName.length > 40) {
    fieldErrors.push("contactName")
  }

  if (contactDetails.length < 4 || contactDetails.length > 120) {
    fieldErrors.push("contactDetails")
  }

  if (notes.length > 1200) {
    fieldErrors.push("notes")
  }

  const normalizedUrl = normalizeWebsiteUrl(rawSiteUrl)

  if (!normalizedUrl) {
    fieldErrors.push("siteUrl")
  }

  const categorySlugSet = new Set(getCategories(defaultLocale).map((category) => category.slug))
  const marketSlugSet = new Set(getMarkets(defaultLocale).map((market) => market.slug))
  const platformSlugSet = new Set(getPlatforms(defaultLocale).map((platform) => platform.slug))

  validateSelections("categorySlugs", categorySlugs, categorySlugSet, fieldErrors)
  validateSelections("marketSlugs", marketSlugs, marketSlugSet, fieldErrors)
  validateSelections("platformSlugs", platformSlugs, platformSlugSet, fieldErrors)

  if (fieldErrors.length > 0 || !normalizedUrl || !locale) {
    return {
      ok: false,
      code: "invalid_payload",
      fieldErrors: [...new Set(fieldErrors)]
    }
  }

  return {
    ok: true,
    data: {
      locale,
      siteName,
      siteUrl: normalizedUrl.siteUrl,
      normalizedDomain: normalizedUrl.normalizedDomain,
      description,
      categorySlugs,
      marketSlugs,
      platformSlugs,
      contactName,
      contactDetails,
      notes,
      turnstileToken
    }
  }
}

export function findExistingToolByDomain(normalizedDomain: string): ExistingToolMatch | null {
  const existingTool = getTools(defaultLocale).find((tool) => tool.normalizedDomain === normalizedDomain)

  if (!existingTool) {
    return null
  }

  return {
    name: existingTool.nameDefault,
    officialUrl: existingTool.officialUrl,
    slug: existingTool.slug
  }
}

function getGitHubSubmissionConfig() {
  const repository = process.env.GITHUB_SUBMISSIONS_REPO?.trim()
  const token = process.env.GITHUB_SUBMISSIONS_TOKEN?.trim()
  const labels = process.env.GITHUB_SUBMISSIONS_LABELS?.split(",").map((label) => label.trim()).filter(Boolean) ?? []

  if (!repository || !token) {
    return null
  }

  const [owner, repo] = repository.split("/")

  if (!owner || !repo) {
    return null
  }

  return {
    owner,
    repo,
    token,
    labels
  }
}

function resolveOptionLabels(locale: Locale, slugs: string[], scope: "category" | "market" | "platform") {
  const items =
    scope === "category"
      ? getCategories(locale)
      : scope === "market"
        ? getMarkets(locale)
        : getPlatforms(locale)

  const labelMap = new Map(items.map((item) => [item.slug, item.translation.name]))

  if (slugs.length === 0) {
    return "- None"
  }

  return slugs.map((slug) => `- ${labelMap.get(slug) ?? slug} (\`${slug}\`)`).join("\n")
}

function buildIssueBody(submission: NormalizedSubmission) {
  return [
    "## Submission Summary",
    `- Locale: ${getLocaleLabel(submission.locale)} (${submission.locale})`,
    `- Site name: ${submission.siteName}`,
    `- Site URL: ${submission.siteUrl}`,
    `- Domain: ${submission.normalizedDomain}`,
    `- Contact: ${submission.contactName} / ${submission.contactDetails}`,
    `- Submitted at: ${new Date().toISOString()}`,
    "",
    "## Description",
    submission.description,
    "",
    "## Suggested Categories",
    resolveOptionLabels(submission.locale, submission.categorySlugs, "category"),
    "",
    "## Suggested Markets",
    resolveOptionLabels(submission.locale, submission.marketSlugs, "market"),
    "",
    "## Suggested Platforms",
    resolveOptionLabels(submission.locale, submission.platformSlugs, "platform"),
    "",
    "## Notes",
    submission.notes || "- None",
    "",
    "## Review Checklist",
    "- [ ] Review label moved from `pending-review` to the next status",
    "- [ ] URL is reachable and relevant",
    "- [ ] Not already indexed in `content/tools/index.json`",
    "- [ ] Category, market, and platform tags confirmed",
    "- [ ] Copy edited for public listing",
    "- [ ] Content prepared for merge and next deployment"
  ].join("\n")
}

function getTurnstileSecretKey() {
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim()
  return secretKey ? secretKey : null
}

export function isTurnstileEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() && getTurnstileSecretKey())
}

export function getRequestIpAddress(headers: Headers) {
  const remoteIp =
    headers.get("CF-Connecting-IP")?.trim() ??
    headers
      .get("X-Forwarded-For")
      ?.split(",")
      .map((item) => item.trim())
      .find(Boolean) ??
    null

  return remoteIp || null
}

export async function validateTurnstileToken(token: string, remoteIp: string | null): Promise<TurnstileVerificationResult> {
  const secretKey = getTurnstileSecretKey()

  if (!secretKey) {
    return {
      ok: true
    }
  }

  if (!token) {
    return {
      ok: false,
      code: "turnstile_required"
    }
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      secret: secretKey,
      response: token,
      remoteip: remoteIp,
      idempotency_key: crypto.randomUUID()
    })
  })

  const responseText = await response.text()

  if (!response.ok) {
    console.error("Turnstile verification request failed", response.status, responseText)

    return {
      ok: false,
      code: "turnstile_failed"
    }
  }

  const result = JSON.parse(responseText) as {
    success?: boolean
    hostname?: string
    "error-codes"?: string[]
  }

  if (result.success !== true) {
    console.error("Turnstile verification rejected submission", result["error-codes"] ?? [])

    return {
      ok: false,
      code: "turnstile_failed"
    }
  }

  return {
    ok: true
  }
}

export async function createGitHubSubmissionIssue(submission: NormalizedSubmission): Promise<GitHubIssueResult> {
  const config = getGitHubSubmissionConfig()

  if (!config) {
    return {
      ok: false,
      code: "not_configured"
    }
  }

  const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/issues`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "User-Agent": "silkroads-trade-submissions",
      "X-GitHub-Api-Version": GITHUB_API_VERSION
    },
    body: JSON.stringify({
      title: `[Submission][${submission.locale}] ${submission.siteName}`,
      body: buildIssueBody(submission),
      labels: config.labels
    })
  })

  const responseText = await response.text()

  if (!response.ok) {
    console.error("Failed to create GitHub issue for submission", response.status, responseText)

    return {
      ok: false,
      code: "github_failed"
    }
  }

  const issue = JSON.parse(responseText) as { html_url?: string; number?: number }

  if (!issue.html_url || typeof issue.number !== "number") {
    console.error("GitHub issue response missing expected fields", responseText)

    return {
      ok: false,
      code: "github_failed"
    }
  }

  return {
    ok: true,
    issueNumber: issue.number,
    issueUrl: issue.html_url
  }
}
