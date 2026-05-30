"use client"

import { useState, type FormEvent } from "react"

import { TurnstileWidget } from "@/components/public/turnstile-widget"
import { Button } from "@/components/ui/button"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/get-dictionary"
import type { SubmissionPayload, SubmissionResponse } from "@/lib/submissions/types"

type SubmissionOption = {
  slug: string
  label: string
}

type SubmitFormProps = {
  locale: Locale
  copy: Dictionary["submit"]
  categories: SubmissionOption[]
  markets: SubmissionOption[]
  platforms: SubmissionOption[]
  turnstileSiteKey?: string
}

type FeedbackState =
  | {
      status: "idle"
    }
  | {
      status: "success"
      issueNumber?: number
      issueUrl?: string
    }
  | {
      status: "duplicate"
      existingUrl?: string
    }
  | {
      status: "error"
      code: SubmissionResponse["code"]
    }

const inputClassName =
  "mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary/35 focus:ring-2 focus:ring-primary/10"

const checkboxClassName =
  "mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/20"

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function getErrorDescription(copy: Dictionary["submit"], code: SubmissionResponse["code"]) {
  switch (code) {
    case "invalid_payload":
      return copy.feedback.validationError
    case "not_configured":
      return copy.feedback.configError
    case "spam_detected":
      return copy.feedback.spamError
    case "turnstile_required":
      return copy.feedback.turnstileRequired
    case "turnstile_failed":
      return copy.feedback.turnstileFailed
    default:
      return copy.feedback.errorDescription
  }
}

export function SubmitForm({ locale, copy, categories, markets, platforms, turnstileSiteKey }: SubmitFormProps) {
  const [feedback, setFeedback] = useState<FeedbackState>({ status: "idle" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState("")
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const payload: SubmissionPayload = {
      locale,
      siteName: getStringValue(formData, "siteName"),
      siteUrl: getStringValue(formData, "siteUrl"),
      description: getStringValue(formData, "description"),
      categorySlugs: formData.getAll("categorySlugs").map(String),
      marketSlugs: formData.getAll("marketSlugs").map(String),
      platformSlugs: formData.getAll("platformSlugs").map(String),
      contactName: getStringValue(formData, "contactName"),
      contactDetails: getStringValue(formData, "contactDetails"),
      notes: getStringValue(formData, "notes"),
      company: getStringValue(formData, "company"),
      turnstileToken
    }

    if (turnstileSiteKey && !turnstileToken) {
      setFeedback({
        status: "error",
        code: "turnstile_required"
      })
      return
    }

    setIsSubmitting(true)
    setFeedback({ status: "idle" })

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      const result = (await response.json().catch(() => null)) as SubmissionResponse | null

      if (response.ok && result?.ok) {
        form.reset()
        setTurnstileToken("")
        setFeedback({
          status: "success",
          issueNumber: result.issueNumber,
          issueUrl: result.issueUrl
        })
        return
      }

      if (result?.code === "duplicate_domain") {
        setFeedback({
          status: "duplicate",
          existingUrl: result.existingUrl
        })
        return
      }

      setFeedback({
        status: "error",
        code: result?.code ?? "github_failed"
      })
    } catch {
      setFeedback({
        status: "error",
        code: "github_failed"
      })
    } finally {
      setIsSubmitting(false)

      if (turnstileSiteKey) {
        setTurnstileToken("")
        setTurnstileResetKey((current) => current + 1)
      }
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <p className="text-sm leading-6 text-muted-foreground">{copy.requiredHint}</p>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label={copy.fields.siteName}>
          <input
            name="siteName"
            type="text"
            required
            minLength={2}
            maxLength={80}
            placeholder={copy.placeholders.siteName}
            className={inputClassName}
            autoComplete="organization"
          />
        </Field>
        <Field label={copy.fields.siteUrl}>
          <input
            name="siteUrl"
            type="text"
            required
            maxLength={240}
            placeholder={copy.placeholders.siteUrl}
            className={inputClassName}
            autoComplete="url"
          />
        </Field>
      </div>

      <Field label={copy.fields.description}>
        <textarea
          name="description"
          required
          minLength={20}
          maxLength={1200}
          placeholder={copy.placeholders.description}
          className={`${inputClassName} min-h-36 resize-y`}
        />
      </Field>

      <div className="grid gap-6 xl:grid-cols-3">
        <CheckboxGroup
          title={copy.sections.categories}
          hint={copy.hints.categories}
          name="categorySlugs"
          options={categories}
        />
        <CheckboxGroup title={copy.sections.markets} hint={copy.hints.markets} name="marketSlugs" options={markets} />
        <CheckboxGroup
          title={copy.sections.platforms}
          hint={copy.hints.platforms}
          name="platformSlugs"
          options={platforms}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label={copy.fields.contactName}>
          <input
            name="contactName"
            type="text"
            required
            minLength={2}
            maxLength={40}
            placeholder={copy.placeholders.contactName}
            className={inputClassName}
            autoComplete="name"
          />
        </Field>
        <Field label={copy.fields.contactDetails}>
          <input
            name="contactDetails"
            type="text"
            required
            minLength={4}
            maxLength={120}
            placeholder={copy.placeholders.contactDetails}
            className={inputClassName}
            autoComplete="email"
          />
        </Field>
      </div>

      <Field label={copy.fields.notes}>
        <textarea
          name="notes"
          maxLength={1200}
          placeholder={copy.placeholders.notes}
          className={`${inputClassName} min-h-28 resize-y`}
        />
      </Field>

      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {turnstileSiteKey ? (
        <div className="space-y-3 rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
          <p className="text-sm leading-6 text-muted-foreground">{copy.securityNotice}</p>
          <TurnstileWidget
            locale={locale}
            siteKey={turnstileSiteKey}
            resetKey={turnstileResetKey}
            onTokenChange={setTurnstileToken}
            onWidgetError={() => {
              setFeedback({
                status: "error",
                code: "turnstile_failed"
              })
            }}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted-foreground">{copy.reviewNotice}</p>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? copy.submitting : copy.submitButton}
        </Button>
      </div>

      <div aria-live="polite">
        {feedback.status === "success" ? (
          <StatusCard tone="success" title={copy.feedback.successTitle} description={copy.feedback.successDescription}>
            {feedback.issueNumber ? <p>{copy.feedback.issueNumber}: #{feedback.issueNumber}</p> : null}
            {feedback.issueUrl ? (
              <a
                href={feedback.issueUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-sm font-medium text-emerald-900 underline underline-offset-4"
              >
                {copy.feedback.viewIssue}
              </a>
            ) : null}
          </StatusCard>
        ) : null}

        {feedback.status === "duplicate" ? (
          <StatusCard tone="warning" title={copy.feedback.duplicateTitle} description={copy.feedback.duplicateDescription}>
            {feedback.existingUrl ? (
              <p>
                {copy.feedback.existingSite}:{" "}
                <a
                  href={feedback.existingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-amber-950 underline underline-offset-4"
                >
                  {feedback.existingUrl}
                </a>
              </p>
            ) : null}
          </StatusCard>
        ) : null}

        {feedback.status === "error" ? (
          <StatusCard
            tone="error"
            title={copy.feedback.errorTitle}
            description={getErrorDescription(copy, feedback.code)}
          />
        ) : null}
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
    </label>
  )
}

function CheckboxGroup({
  title,
  hint,
  name,
  options
}: {
  title: string
  hint: string
  name: "categorySlugs" | "marketSlugs" | "platformSlugs"
  options: SubmissionOption[]
}) {
  return (
    <fieldset className="space-y-3 rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
      <legend className="px-1 text-sm font-medium text-foreground">{title}</legend>
      <p className="text-xs leading-5 text-muted-foreground">{hint}</p>
      <div className="grid gap-2">
        {options.map((option) => (
          <label
            key={option.slug}
            className="flex items-start gap-3 rounded-2xl border border-border/70 bg-white/70 px-3 py-2 text-sm text-foreground transition hover:border-primary/25 dark:bg-card/60"
          >
            <input type="checkbox" name={name} value={option.slug} className={checkboxClassName} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function StatusCard({
  tone,
  title,
  description,
  children
}: {
  tone: "success" | "warning" | "error"
  title: string
  description: string
  children?: React.ReactNode
}) {
  const toneClassName =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-950"
        : "border-rose-200 bg-rose-50 text-rose-950"

  return (
    <div className={`rounded-[1.5rem] border p-4 text-sm ${toneClassName}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 leading-6">{description}</p>
      {children ? <div className="mt-3 space-y-2">{children}</div> : null}
    </div>
  )
}
