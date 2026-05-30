import type { Locale } from "@/lib/i18n/config"

export type SubmissionPayload = {
  locale: Locale
  siteName: string
  siteUrl: string
  description: string
  categorySlugs: string[]
  marketSlugs: string[]
  platformSlugs: string[]
  contactName: string
  contactDetails: string
  notes: string
  company?: string
  turnstileToken?: string
}

export type SubmissionResponseCode =
  | "created"
  | "duplicate_domain"
  | "invalid_payload"
  | "not_configured"
  | "github_failed"
  | "spam_detected"
  | "turnstile_required"
  | "turnstile_failed"

export type SubmissionResponse = {
  ok: boolean
  code: SubmissionResponseCode
  issueNumber?: number
  issueUrl?: string
  existingUrl?: string
  fieldErrors?: string[]
}
