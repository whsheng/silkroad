"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import type { Locale } from "@/lib/i18n/config"
import type { SearchEntry } from "@/lib/content/types"

export function SearchDialog({
  locale,
  label
}: {
  locale: Locale
  label: string
}) {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<SearchEntry[]>([])

  useEffect(() => {
    if (!open || entries.length > 0) {
      return
    }

    const controller = new AbortController()

    fetch(`/generated/search/${locale}.json`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload: SearchEntry[]) => setEntries(payload))
      .catch(() => {
        setEntries([])
      })

    return () => {
      controller.abort()
    }
  }, [entries.length, locale, open])

  const groupedEntries = useMemo(() => {
    return entries.reduce<Record<string, SearchEntry[]>>((groups, entry) => {
      if (!groups[entry.type]) {
        groups[entry.type] = []
      }

      groups[entry.type].push(entry)
      return groups
    }, {})
  }, [entries])

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full justify-start rounded-full border-border/80 bg-white/80 px-4 text-left text-muted-foreground shadow-none md:max-w-md"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="mr-3 h-4 w-4" />
        <span>{label}</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={label} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedEntries).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((entry) =>
                entry.external ? (
                  <CommandItem
                    key={`${entry.type}-${entry.href}`}
                    onSelect={() => window.open(entry.href, "_blank", "noopener,noreferrer")}
                  >
                    <div className="flex flex-col">
                      <span>{entry.title}</span>
                      <span className="text-xs text-muted-foreground">{entry.description}</span>
                    </div>
                  </CommandItem>
                ) : (
                  <CommandItem key={`${entry.type}-${entry.href}`}>
                    <Link href={entry.href} onClick={() => setOpen(false)} className="flex w-full flex-col">
                      <div className="flex flex-col">
                        <span>{entry.title}</span>
                        <span className="text-xs text-muted-foreground">{entry.description}</span>
                      </div>
                    </Link>
                  </CommandItem>
                )
              )}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
