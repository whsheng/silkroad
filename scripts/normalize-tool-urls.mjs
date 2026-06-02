import fs from "node:fs"
import path from "node:path"

const repoRoot = process.cwd()
const contentRoot = path.join(repoRoot, "content")
const reportsRoot = path.join(repoRoot, "reports")

const removableParamPatterns = [/^utm_/i, /^source$/i, /^ref$/i, /^referral$/i, /^refcode$/i, /^msclkid$/i, /^invitecode$/i, /^channel$/i]
const suspiciousDomains = new Set(["ikjzd.com", "tools.ikjzd.com", "suo.im"])

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(contentRoot, relativePath), "utf8"))
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(contentRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function hasFlag(flag) {
  return process.argv.includes(flag)
}

function getDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai"
  }).format(new Date())
}

function normalizeDomain(input) {
  return input.replace(/^www\./i, "").toLowerCase()
}

function sanitizeUrl(originalUrl) {
  const reasons = []
  const fixedBrokenPrefix = originalUrl.replace(/^https?:\/\/tools\.ikjzd\.comwww\./i, "https://www.")
  let workingUrl = fixedBrokenPrefix

  if (fixedBrokenPrefix !== originalUrl) {
    reasons.push("broken_ikjzd_prefix")
  }

  let url

  try {
    url = new URL(workingUrl)
  } catch {
    return {
      originalUrl,
      sanitizedUrl: workingUrl,
      normalizedDomain: null,
      changed: workingUrl !== originalUrl,
      suspicious: true,
      reasons: [...reasons, "invalid_url"]
    }
  }

  if (url.hash && /kjzd|ikjzd/i.test(url.hash)) {
    url.hash = ""
    reasons.push("removed_campaign_fragment")
  }

  const removedParams = []

  for (const key of [...url.searchParams.keys()]) {
    if (removableParamPatterns.some((pattern) => pattern.test(key))) {
      url.searchParams.delete(key)
      removedParams.push(key)
    }
  }

  if (removedParams.length > 0) {
    reasons.push(`removed_query_params:${removedParams.join("|")}`)
  }

  const sanitizedUrl = url.toString()
  const normalizedDomain = normalizeDomain(url.hostname)
  const suspicious =
    suspiciousDomains.has(normalizedDomain) ||
    normalizedDomain.startsWith("share.") ||
    normalizedDomain.startsWith("marketing.") ||
    normalizedDomain.startsWith("discover.") ||
    normalizedDomain.startsWith("activity.")

  return {
    originalUrl,
    sanitizedUrl,
    normalizedDomain,
    changed: sanitizedUrl !== originalUrl,
    suspicious,
    reasons
  }
}

function main() {
  const apply = hasFlag("--apply")
  const tools = readJson("tools/index.json")
  const changed = []
  const suspicious = []

  const updatedTools = tools.map((tool) => {
    const result = sanitizeUrl(tool.officialUrl)

    if (result.suspicious) {
      suspicious.push({
        slug: tool.slug,
        officialUrl: tool.officialUrl,
        normalizedDomain: tool.normalizedDomain,
        sanitizedUrl: result.sanitizedUrl,
        sanitizedDomain: result.normalizedDomain,
        reasons: result.reasons
      })
    }

    if (!result.changed) {
      return tool
    }

    changed.push({
      slug: tool.slug,
      officialUrl: tool.officialUrl,
      sanitizedUrl: result.sanitizedUrl,
      reasons: result.reasons
    })

    return {
      ...tool,
      officialUrl: result.sanitizedUrl,
      normalizedDomain: result.normalizedDomain ?? tool.normalizedDomain
    }
  })

  ensureDir(reportsRoot)

  const payload = {
    generatedAt: new Date().toISOString(),
    dateKey: getDateKey(),
    changedCount: changed.length,
    suspiciousCount: suspicious.length,
    changed,
    suspicious
  }

  const reportPath = path.join(reportsRoot, `tool-url-normalization-${payload.dateKey}.json`)
  fs.writeFileSync(reportPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8")

  if (apply) {
    writeJson("tools/index.json", updatedTools)
  }

  console.log(
    JSON.stringify(
      {
        changedCount: changed.length,
        suspiciousCount: suspicious.length,
        applied: apply,
        reportPath: path.relative(repoRoot, reportPath)
      },
      null,
      2
    )
  )
}

main()
