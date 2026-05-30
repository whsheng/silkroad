"use client"

import Script from "next/script"
import { useEffect, useRef, useState } from "react"

import type { Locale } from "@/lib/i18n/config"

type TurnstileWidgetProps = {
  locale: Locale
  siteKey: string
  resetKey: number
  onTokenChange: (token: string) => void
  onWidgetError: () => void
}

function resolveTurnstileLanguage(locale: Locale) {
  return locale === "zh-CN" ? "zh-CN" : "en"
}

export function TurnstileWidget({
  locale,
  siteKey,
  resetKey,
  onTokenChange,
  onWidgetError
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const tokenChangeRef = useRef(onTokenChange)
  const widgetErrorRef = useRef(onWidgetError)
  const [isScriptReady, setIsScriptReady] = useState(false)

  useEffect(() => {
    tokenChangeRef.current = onTokenChange
  }, [onTokenChange])

  useEffect(() => {
    widgetErrorRef.current = onWidgetError
  }, [onWidgetError])

  useEffect(() => {
    if (!isScriptReady || !containerRef.current || !window.turnstile || widgetIdRef.current) {
      return
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "auto",
      language: resolveTurnstileLanguage(locale),
      callback(token) {
        tokenChangeRef.current(token)
      },
      "expired-callback"() {
        tokenChangeRef.current("")
      },
      "timeout-callback"() {
        tokenChangeRef.current("")
      },
      "error-callback"() {
        tokenChangeRef.current("")
        widgetErrorRef.current()
      }
    })

    return () => {
      if (!widgetIdRef.current || !window.turnstile) {
        return
      }

      window.turnstile.remove(widgetIdRef.current)
      widgetIdRef.current = null
    }
  }, [isScriptReady, locale, siteKey])

  useEffect(() => {
    if (!resetKey || !widgetIdRef.current || !window.turnstile) {
      return
    }

    tokenChangeRef.current("")
    window.turnstile.reset(widgetIdRef.current)
  }, [resetKey])

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => {
          setIsScriptReady(true)
        }}
      />
      <div ref={containerRef} />
    </>
  )
}
