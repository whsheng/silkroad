import fs from "node:fs"
import path from "node:path"

const repoRoot = process.cwd()
const contentRoot = path.join(repoRoot, "content")
const reportsRoot = path.join(repoRoot, "reports")

const knownAggregatorDomains = new Set([
  "ikjzd.com",
  "10100.com",
  "amz123.com",
  "kuajingyan.com",
  "mjzj.com"
])

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(contentRoot, relativePath), "utf8"))
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(contentRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function getArgValue(flag) {
  const index = process.argv.indexOf(flag)
  return index >= 0 ? process.argv[index + 1] : undefined
}

function hasFlag(flag) {
  return process.argv.includes(flag)
}

function sanitizeTitle(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim()
}

function normalizeDomain(input) {
  return input.replace(/^www\./i, "").toLowerCase()
}

function classifyAuditResult(tool, result) {
  if (!result.reachable && [401, 403, 405].includes(result.httpStatus)) {
    return "review_needed"
  }

  if (!result.reachable) {
    return "dead"
  }

  if (result.finalDomain && knownAggregatorDomains.has(result.finalDomain)) {
    return "aggregator"
  }

  if (result.finalUrl && /parking|sedo|dan\.com|buy this domain|coming soon/i.test(`${result.pageTitle} ${result.finalUrl}`)) {
    return "parked"
  }

  if (!result.pageTitle || result.pageTitle.length < 3) {
    return "review_needed"
  }

  if (result.finalDomain && result.finalDomain !== tool.normalizedDomain) {
    return "redirected"
  }

  return "ok"
}

async function fetchWithRedirects(url, redirectLimit = 5) {
  let currentUrl = url
  const visited = []

  for (let step = 0; step <= redirectLimit; step += 1) {
    visited.push(currentUrl)

    const response = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": "silkroads-trade-audit/1.0"
      }
    })

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location")

      if (!location) {
        return {
          ok: false,
          status: response.status,
          finalUrl: currentUrl,
          visited
        }
      }

      currentUrl = new URL(location, currentUrl).toString()
      continue
    }

    const html = await response.text()
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    const finalDomain = normalizeDomain(new URL(currentUrl).hostname)

    return {
      ok: response.ok,
      status: response.status,
      finalUrl: currentUrl,
      finalDomain,
      pageTitle: sanitizeTitle(titleMatch?.[1] ?? ""),
      visited
    }
  }

  return {
    ok: false,
    status: 310,
    finalUrl: currentUrl,
    visited
  }
}

async function auditTool(tool) {
  try {
    const response = await fetchWithRedirects(tool.officialUrl)
    const auditStatus = classifyAuditResult(tool, {
      reachable: response.ok,
      httpStatus: response.status,
      finalUrl: response.finalUrl ?? tool.officialUrl,
      finalDomain: response.finalDomain ?? tool.normalizedDomain,
      pageTitle: response.pageTitle ?? ""
    })

    return {
      slug: tool.slug,
      officialUrl: tool.officialUrl,
      normalizedDomain: tool.normalizedDomain,
      publicationStatus: tool.publicationStatus ?? "candidate",
      reachable: response.ok,
      httpStatus: response.status,
      finalUrl: response.finalUrl ?? tool.officialUrl,
      finalDomain: response.finalDomain ?? tool.normalizedDomain,
      pageTitle: response.pageTitle ?? "",
      auditStatus,
      redirectChain: response.visited ?? [],
      error: null
    }
  } catch (error) {
    return {
      slug: tool.slug,
      officialUrl: tool.officialUrl,
      normalizedDomain: tool.normalizedDomain,
      publicationStatus: tool.publicationStatus ?? "candidate",
      reachable: false,
      httpStatus: 0,
      finalUrl: tool.officialUrl,
      finalDomain: tool.normalizedDomain,
      pageTitle: "",
      auditStatus: "dead",
      redirectChain: [tool.officialUrl],
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

function buildSummary(results) {
  const counts = results.reduce((map, item) => {
    map[item.auditStatus] = (map[item.auditStatus] ?? 0) + 1
    return map
  }, {})

  return {
    total: results.length,
    byAuditStatus: counts
  }
}

async function main() {
  const limitArg = getArgValue("--limit")
  const offsetArg = getArgValue("--offset")
  const slugsArg = getArgValue("--slugs")
  const includePublished = hasFlag("--include-published")
  const apply = hasFlag("--apply")
  const limit = limitArg ? Number(limitArg) : null
  const offset = offsetArg ? Number(offsetArg) : 0

  if (limitArg) {
    if (!Number.isInteger(limit) || limit <= 0) {
      throw new Error("--limit must be a positive integer")
    }
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error("--offset must be a non-negative integer")
  }

  const allTools = readJson("tools/index.json")
  const requestedSlugs = slugsArg
    ? new Set(
        slugsArg
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      )
    : null
  const candidateTools = allTools.filter((tool) => includePublished || (tool.publicationStatus ?? "candidate") !== "published")
  const scopedTools = requestedSlugs ? candidateTools.filter((tool) => requestedSlugs.has(tool.slug)) : candidateTools
  const selectedTools = limit ? scopedTools.slice(offset, offset + limit) : scopedTools.slice(offset)

  const results = []

  for (const tool of selectedTools) {
    const result = await auditTool(tool)
    results.push(result)
    console.log(`[audit] ${result.slug} -> ${result.auditStatus} (${result.httpStatus})`)
  }

  ensureDir(reportsRoot)

  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai"
  }).format(new Date())
  const reportPayload = {
    generatedAt: new Date().toISOString(),
    dateKey,
    offset,
    limit: limit ?? selectedTools.length,
    requestedSlugs: requestedSlugs ? [...requestedSlugs] : null,
    includePublished,
    summary: buildSummary(results),
    results
  }

  const jsonPath = path.join(reportsRoot, `tool-audit-${dateKey}.json`)
  fs.writeFileSync(jsonPath, `${JSON.stringify(reportPayload, null, 2)}\n`, "utf8")

  const csvHeader = ["slug", "officialUrl", "httpStatus", "finalUrl", "finalDomain", "auditStatus", "pageTitle", "error"]
  const csvRows = results.map((item) =>
    [
      item.slug,
      item.officialUrl,
      item.httpStatus,
      item.finalUrl,
      item.finalDomain,
      item.auditStatus,
      item.pageTitle,
      item.error ?? ""
    ]
      .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
      .join(",")
  )
  const csvPath = path.join(reportsRoot, `tool-audit-${dateKey}.csv`)
  fs.writeFileSync(csvPath, `${csvHeader.join(",")}\n${csvRows.join("\n")}\n`, "utf8")

  if (apply) {
    const resultMap = new Map(results.map((item) => [item.slug, item]))
    const updatedTools = allTools.map((tool) => {
      const result = resultMap.get(tool.slug)

      if (!result) {
        return tool
      }

      const nextPublicationStatus =
        tool.publicationStatus === "published" && ["dead", "parked", "aggregator"].includes(result.auditStatus)
          ? "hidden"
          : tool.publicationStatus ?? "candidate"

      return {
        ...tool,
        publicationStatus: nextPublicationStatus,
        auditStatus: result.auditStatus,
        lastCheckedAt: dateKey,
        finalUrl: result.finalUrl,
        finalDomain: result.finalDomain,
        pageTitle: result.pageTitle
      }
    })

    writeJson("tools/index.json", updatedTools)
  }

  console.log(JSON.stringify({ jsonPath, csvPath, applied: apply, summary: reportPayload.summary }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
