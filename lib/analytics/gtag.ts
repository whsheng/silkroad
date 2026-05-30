"use client"

type TrackAdClickInput = {
  adId: string
  placementKey: string
  locale: string
  targetType: string
  targetSlug: string | null
  targetUrl: string
}

export function trackAdClick(input: TrackAdClickInput) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return
  }

  window.gtag("event", "ad_click", {
    ad_id: input.adId,
    placement_key: input.placementKey,
    page_locale: input.locale,
    target_type: input.targetType,
    target_slug: input.targetSlug ?? "all",
    target_url: input.targetUrl
  })
}
