export const toolPublicationStatuses = ["candidate", "published", "hidden", "rejected"]

export const toolAuditStatuses = ["unchecked", "ok", "redirected", "dead", "parked", "aggregator", "review_needed"]

export function getToolPublicationStatus(tool) {
  if (tool && typeof tool.publicationStatus === "string" && toolPublicationStatuses.includes(tool.publicationStatus)) {
    return tool.publicationStatus
  }

  if (tool?.sourceType === "manual_editor" && tool?.verificationStatus === "reviewed") {
    return "published"
  }

  return "candidate"
}

export function getToolAuditStatus(tool) {
  if (tool && typeof tool.auditStatus === "string" && toolAuditStatuses.includes(tool.auditStatus)) {
    return tool.auditStatus
  }

  return "unchecked"
}

export function isToolPublished(tool) {
  return getToolPublicationStatus(tool) === "published"
}

export function normalizeToolRecord(tool) {
  return {
    ...tool,
    publicationStatus: getToolPublicationStatus(tool),
    auditStatus: getToolAuditStatus(tool)
  }
}
