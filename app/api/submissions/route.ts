import { NextResponse } from "next/server"

import {
  createGitHubSubmissionIssue,
  findExistingToolByDomain,
  getRequestIpAddress,
  validateSubmissionPayload,
  validateTurnstileToken
} from "@/lib/submissions/server"
import type { SubmissionResponse } from "@/lib/submissions/types"

export const runtime = "nodejs"

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json<SubmissionResponse>(
      {
        ok: false,
        code: "invalid_payload",
        fieldErrors: ["payload"]
      },
      { status: 400 }
    )
  }

  const validation = validateSubmissionPayload(payload)

  if (!validation.ok) {
    return NextResponse.json<SubmissionResponse>(
      {
        ok: false,
        code: validation.code,
        fieldErrors: validation.fieldErrors
      },
      { status: validation.code === "spam_detected" ? 400 : 422 }
    )
  }

  const turnstileValidation = await validateTurnstileToken(
    validation.data.turnstileToken,
    getRequestIpAddress(request.headers)
  )

  if (!turnstileValidation.ok) {
    return NextResponse.json<SubmissionResponse>(
      {
        ok: false,
        code: turnstileValidation.code
      },
      { status: 400 }
    )
  }

  const existingTool = findExistingToolByDomain(validation.data.normalizedDomain)

  if (existingTool) {
    return NextResponse.json<SubmissionResponse>(
      {
        ok: false,
        code: "duplicate_domain",
        existingUrl: existingTool.officialUrl
      },
      { status: 409 }
    )
  }

  const issueResult = await createGitHubSubmissionIssue(validation.data)

  if (!issueResult.ok) {
    return NextResponse.json<SubmissionResponse>(
      {
        ok: false,
        code: issueResult.code
      },
      { status: issueResult.code === "not_configured" ? 503 : 502 }
    )
  }

  return NextResponse.json<SubmissionResponse>(
    {
      ok: true,
      code: "created",
      issueNumber: issueResult.issueNumber,
      issueUrl: issueResult.issueUrl
    },
    { status: 201 }
  )
}
