type TurnstileRenderOptions = {
  sitekey: string
  theme?: "light" | "dark" | "auto"
  language?: string
  callback?: (token: string) => void
  "error-callback"?: () => void
  "expired-callback"?: () => void
  "timeout-callback"?: () => void
}

type TurnstileRenderable = HTMLElement | string

declare global {
  interface Window {
    turnstile?: {
      render: (container: TurnstileRenderable, options: TurnstileRenderOptions) => string
      reset: (widget?: string | TurnstileRenderable) => void
      remove: (widget: string | TurnstileRenderable) => void
    }
  }
}

export {}
