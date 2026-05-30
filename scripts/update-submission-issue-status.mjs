const reviewStatuses = ["pending-review", "needs-info", "approved", "rejected", "published"]
const issueNumberFlag = "--issue-number"
const statusFlag = "--status"
const commentFlag = "--comment"
const commentFileFlag = "--comment-file"
const dryRunFlag = "--dry-run"
const githubApiVersion = "2022-11-28"

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function hasFlag(flag) {
  return process.argv.includes(flag)
}

function getArgValue(flag) {
  const index = process.argv.indexOf(flag)
  return index >= 0 ? process.argv[index + 1] : undefined
}

function getGitHubConfig() {
  const repository = process.env.GITHUB_SUBMISSIONS_REPO?.trim()
  const token = process.env.GITHUB_SUBMISSIONS_TOKEN?.trim()

  if (!repository || !token) {
    return null
  }

  const [owner, repo] = repository.split("/")

  if (!owner || !repo) {
    return null
  }

  return {
    owner,
    repo,
    token
  }
}

function getDefaultComment(status) {
  if (status === "needs-info") {
    return "This submission needs more information before it can move forward in review."
  }

  if (status === "approved") {
    return "This submission has been approved for inclusion and is moving into the publishing workflow."
  }

  if (status === "rejected") {
    return "This submission will not be published at this time."
  }

  if (status === "published") {
    return "This submission has been published to Silkroads Trade and the site deployment has been triggered."
  }

  return ""
}

function buildNextLabels(currentLabels, status) {
  const filtered = currentLabels.filter((label) => !reviewStatuses.includes(label))

  if (!filtered.includes("submission")) {
    filtered.unshift("submission")
  }

  if (!filtered.includes(status)) {
    filtered.push(status)
  }

  return filtered
}

async function requestGitHub(config, pathname, options = {}) {
  const response = await fetch(`https://api.github.com${pathname}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "User-Agent": "silkroads-trade-submission-review",
      "X-GitHub-Api-Version": githubApiVersion
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${text}`)
  }

  return text ? JSON.parse(text) : null
}

async function main() {
  const issueNumber = Number(getArgValue(issueNumberFlag))
  const status = getArgValue(statusFlag)
  const commentArg = getArgValue(commentFlag)
  const commentFile = getArgValue(commentFileFlag)
  const dryRun = hasFlag(dryRunFlag)

  assert(Number.isInteger(issueNumber) && issueNumber > 0, `Usage: node scripts/update-submission-issue-status.mjs ${issueNumberFlag} <number> ${statusFlag} <status> [${commentFlag} "text"] [${commentFileFlag} path] [${dryRunFlag}]`)
  assert(status && reviewStatuses.includes(status), `Status must be one of: ${reviewStatuses.join(", ")}`)
  assert(!(commentArg && commentFile), "Use either --comment or --comment-file, not both")

  if (dryRun) {
    const commentBody =
      commentFile
        ? await import("node:fs/promises").then((fs) => fs.readFile(commentFile, "utf8"))
        : commentArg ?? getDefaultComment(status)

    console.log(
      JSON.stringify(
        {
          issueNumber,
          nextLabels: ["submission", status],
          commentBody,
          requiresGitHubConfig: true
        },
        null,
        2
      )
    )
    return
  }

  const config = getGitHubConfig()
  assert(config, "Missing GITHUB_SUBMISSIONS_REPO or GITHUB_SUBMISSIONS_TOKEN")

  const issue = await requestGitHub(config, `/repos/${config.owner}/${config.repo}/issues/${issueNumber}`)
  const currentLabels = (issue.labels ?? []).map((label) => (typeof label === "string" ? label : label.name)).filter(Boolean)
  const nextLabels = buildNextLabels(currentLabels, status)
  const commentBody =
    commentFile
      ? await import("node:fs/promises").then((fs) => fs.readFile(commentFile, "utf8"))
      : commentArg ?? getDefaultComment(status)

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          issueNumber,
          issueUrl: issue.html_url,
          currentLabels,
          nextLabels,
          commentBody
        },
        null,
        2
      )
    )
    return
  }

  await requestGitHub(config, `/repos/${config.owner}/${config.repo}/issues/${issueNumber}`, {
    method: "PATCH",
    body: {
      labels: nextLabels
    }
  })

  if (commentBody) {
    await requestGitHub(config, `/repos/${config.owner}/${config.repo}/issues/${issueNumber}/comments`, {
      method: "POST",
      body: {
        body: commentBody
      }
    })
  }

  console.log(
    JSON.stringify(
      {
        issueNumber,
        issueUrl: issue.html_url,
        nextLabels,
        commentPosted: Boolean(commentBody)
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
