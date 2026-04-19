import Anthropic from '@anthropic-ai/sdk'
import type { RichReportData } from '@components/lib/rich-report-generator'

export const maxDuration = 60

const EXTRACTION_PROMPT = `You are extracting structured data from an aviation intelligence report to power a rich visual HTML dashboard.

Return ONLY valid JSON — no markdown, no explanation, no code fences. Match this exact schema:

{
  "title": "string — concise report title (max 8 words)",
  "subtitle": "string — region, date range, or report type",
  "classification": "string — e.g. AVIATION INTELLIGENCE REPORT",
  "period": "string — e.g. Mar 2026 or Last 7 Days",
  "alertBanner": "string or null — one critical alert sentence, null if no high-priority alert",
  "kpis": [
    { "value": "string", "label": "string", "sub": "string", "type": "danger|warning|normal" }
  ],
  "summary": ["paragraph1 string", "paragraph2 string"],
  "events": [
    {
      "time": "string",
      "typeLabel": "string — e.g. AIRSPACE, INCIDENT, NOTAM",
      "typeBadge": "red|yellow|blue|green",
      "location": "string",
      "details": "string — max 25 words",
      "impactLabel": "string — e.g. CLOSED, DELAYED, ADVISORY",
      "impactBadge": "red|yellow|blue|green"
    }
  ],
  "airlines": [
    { "code": "string — IATA code", "name": "string", "status": "string", "statusType": "suspended|partial|divert|normal" }
  ],
  "threats": [
    { "category": "string", "text": "string — max 30 words", "level": "high|medium|info" }
  ],
  "recommendations": ["string", "string"],
  "charts": {
    "bar1": { "title": "string", "subtitle": "string", "labels": ["string"], "data": [number], "unit": "string" } or null,
    "bar2": { "title": "string", "subtitle": "string", "labels": ["string"], "data": [number], "unit": "string" } or null,
    "timeline": { "title": "string", "subtitle": "string", "labels": ["string"], "data": [number] } or null,
    "donut": { "title": "string", "subtitle": "string", "labels": ["string"], "data": [number] } or null
  }
}

Rules:
- kpis: max 6 items. Use the most prominent numbers/statistics from the report. danger = critical/high severity, warning = moderate, normal = informational.
- events: only include if specific dated/timed events are mentioned. Max 12.
- airlines: only if specific airlines/operators are named. Max 12.
- threats: extract 2–6 key risk or threat factors.
- recommendations: extract 3–6 actionable items.
- charts.bar1: use for a primary metric breakdown by entity (e.g. cancellations by country, incidents by region). null if no numeric breakdown exists.
- charts.bar2: use for a secondary metric (e.g. revenue loss by carrier, delays by airline). null if no second numeric breakdown.
- charts.timeline: only if time-series data or cumulative counts by time exist. null otherwise.
- charts.donut: only if percentage breakdown or distribution data exists. null otherwise.
- All data arrays for charts must have matching labels arrays.
- If specific numeric data is not in the report for a chart, set it to null — do NOT fabricate numbers.`

export async function POST(req: Request) {
  try {
    const { reportText, prompt } = await req.json()

    if (!reportText?.trim()) {
      return Response.json({ error: 'reportText is required' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: EXTRACTION_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Original query: "${prompt || 'Aviation intelligence report'}"\n\nReport content to extract from:\n\n${reportText}`,
        },
      ],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

    let data: RichReportData
    try {
      data = JSON.parse(cleaned)
    } catch {
      return Response.json({ error: 'Failed to parse structured data from AI response' }, { status: 500 })
    }

    // Inject generatedAt
    data.generatedAt = new Date().toUTCString().replace(/:\d\d GMT/, 'Z')

    return Response.json(data)
  } catch (err) {
    console.error('[aviation-report/structured]', err)
    const msg = err instanceof Error ? err.message : 'Server error'
    return Response.json({ error: msg }, { status: 500 })
  }
}
