import "@/styles/globals.css"

import type { Metadata } from "next"

import { GoogleAnalytics } from "@/components/public/google-analytics"
import { buildMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildMetadata({
  locale: "zh-CN",
  pathname: ""
})

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#16130f" }
  ]
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <GoogleAnalytics measurementId={measurementId} />
      </body>
    </html>
  )
}
