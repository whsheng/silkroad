import en from "@/messages/en.json"
import zhCN from "@/messages/zh-CN.json"

import type { Locale } from "@/lib/i18n/config"

const dictionaries = {
  "zh-CN": zhCN,
  en
} as const

export type Dictionary = (typeof dictionaries)["zh-CN"]

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
