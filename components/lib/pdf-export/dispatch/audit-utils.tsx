export interface AuditStamp {
  timestamp: string
  sources: string
  payloadHash: string
  fullReport: string
}

export async function generateAuditStamp(
  metarDep: string,
  metarArr: string,
  notam: string,
): Promise<AuditStamp> {
  const utc = new Date().toISOString().replace("T", " ").replace("Z", "Z")
  const payload = [metarDep, metarArr, notam].join("\n")

  let hash = ""
  if (window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder()
    const data = encoder.encode(payload)
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  } else {
    // Fallback hash for older browsers
    let h = 0
    for (let i = 0; i < payload.length; i++) {
      h = (h * 31 + payload.charCodeAt(i)) >>> 0
    }
    hash = "x" + h.toString(16)
  }

  const sources = "Data sources: Skylink API"
  const fullReport = `Audit: ${utc}Z\n${sources}\nPayload SHA-256: ${hash}`

  return {
    timestamp: utc,
    sources,
    payloadHash: hash,
    fullReport,
  }
}

export function generateDeepLink(params: Record<string, string | number | boolean>): string {
  const url = new URL(window.location.href)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value))
    }
  })
  return url.toString()
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}