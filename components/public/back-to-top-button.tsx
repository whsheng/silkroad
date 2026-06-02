"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 320)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  return (
    <div
      className={`fixed bottom-6 right-4 z-50 md:bottom-8 md:right-8 ${
        isVisible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <div className="group relative">
        <div className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-border/70 bg-background/96 px-3 py-1.5 text-xs text-foreground opacity-0 shadow-[0_12px_32px_rgba(15,23,42,0.12)] backdrop-blur transition-opacity group-hover:opacity-100">
          返回顶部
        </div>
        <button
          type="button"
          onClick={handleClick}
          aria-label="Back to top"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-background/92 text-foreground shadow-[0_18px_48px_rgba(15,23,42,0.16)] backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
