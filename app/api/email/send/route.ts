import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// ── Email transporter ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// ── HTML builder (updated) ──────────────────────────────────────────────
function buildHtml(body: string, subject: string): string {
  const escaped = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aeroaviation.me'
  const logoUrl = `${baseUrl}/logos/officialLogo.svg`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <center style="width:100%;table-layout:fixed;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#f8fafc;" role="presentation">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <!-- Main Card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;box-shadow:0 4px 12px rgba(0,0,0,0.04);overflow:hidden;" role="presentation">
            
            <!-- Header: Deep blue background with logo and group name -->
            <tr>
              <td style="background:#0369a1;padding:32px 32px 24px;text-align:center;">
                <img 
                  src="${logoUrl}" 
                  alt="Aero Aviation" 
                  style="max-width:200px;height:auto;display:block;margin:0 auto;border:0;"
                  width="200"
                />
                <!-- Added group name below logo -->
                <p style="margin:12px 0 0;font-size:14px;color:#ffffff;font-weight:500;letter-spacing:0.5px;">
                  Aviate Pro ME LLC Group
                </p>
              </td>
            </tr>
            
            <!-- Subject Bar -->
            <tr>
              <td style="padding:20px 32px 8px;border-bottom:1px solid #eef2f6;">
                <p style="margin:0;font-size:13px;color:#64748b;font-weight:500;">SUBJECT</p>
                <p style="margin:6px 0 0;font-size:16px;color:#0f172a;font-weight:600;line-height:1.4;">${subject}</p>
              </td>
            </tr>
            
            <!-- Body Content -->
            <tr>
              <td style="padding:28px 32px 32px;">
                <div style="color:#1e293b;font-size:16px;line-height:1.7;mso-line-height-alt:150%;">
                  ${escaped}
                </div>
              </td>
            </tr>
            
            <!-- Divider with Sky Accent -->
            <tr>
              <td style="padding:0 32px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#0ea5e9;height:2px;width:60px;"></td>
                    <td style="background:#eef2f6;height:1px;"></td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Beautiful Footer -->
            <tr>
              <td style="padding:28px 32px 32px;background-color:#fafcff;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <!-- Company Name -->
                  <tr>
                    <td align="center" style="padding-bottom:16px;">
                      <span style="font-size:20px;font-weight:700;color:#0ea5e9;letter-spacing:1px;">AERO AVIATION</span>
                    </td>
                  </tr>
                  
                  <!-- Address -->
                  <tr>
                    <td align="center" style="padding-bottom:8px;">
                      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
                        Office 5170m, 3 Fitzroy Place, 1/1, Sauchiehall Street<br>
                        Finnieston, Glasgow Central, G3 7RH, United Kingdom
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Email Only -->
                  <tr>
                    <td align="center" style="padding-bottom:16px;">
                      <p style="margin:0;font-size:13px;color:#64748b;">
                        <a href="mailto:info@aeroaviation.me" style="color:#0ea5e9;text-decoration:none;font-weight:500;">info@aeroaviation.me</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Social Links (LinkedIn + Twitter) -->
                  <tr>
                    <td align="center" style="padding-bottom:20px;">
                      <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                        <tr>
                          <td style="padding:0 12px;"><a href="https://www.linkedin.com/company/aero-aviation-me/" style="color:#0ea5e9;text-decoration:none;font-size:13px;font-weight:500;">LinkedIn</a></td>
                          <td style="padding:0 12px;"><a href="#" style="color:#0ea5e9;text-decoration:none;font-size:13px;font-weight:500;">Twitter</a></td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Legal / Copyright -->
                  <tr>
                    <td align="center">
                      <p style="margin:0;font-size:11px;color:#94a3b8;">
                        © ${new Date().getFullYear()} Aero Aviation. All rights reserved.<br>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
          </table>
          <!-- End Main Card -->
          
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
            <tr><td style="height:20px;"></td></tr>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`
}

// ── POST handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Parse the multipart/form-data
    const formData = await req.formData()

    // Extract string fields (to, cc were sent as JSON strings)
    const toRaw = formData.get('to')
    const ccRaw = formData.get('cc')
    const subjectRaw = formData.get('subject')
    const bodyRaw = formData.get('body')

    let to: string[] = []
    let cc: string[] | undefined = undefined
    let subject = ''
    let body = ''

    // Parse the JSON-encoded to field
    if (typeof toRaw === 'string') {
      try {
        to = JSON.parse(toRaw)
      } catch {
        return NextResponse.json({ error: 'Invalid "to" field format' }, { status: 400 })
      }
    }
    if (typeof ccRaw === 'string') {
      try {
        cc = JSON.parse(ccRaw)
      } catch {
        return NextResponse.json({ error: 'Invalid "cc" field format' }, { status: 400 })
      }
    }
    if (typeof subjectRaw === 'string') subject = subjectRaw.trim()
    if (typeof bodyRaw === 'string') body = bodyRaw.trim()

    if (!to.length || !subject || !body) {
      return NextResponse.json({ error: 'to, subject, and body are required' }, { status: 400 })
    }

    // Gather attachments
    const attachmentFiles = formData.getAll('attachments') as File[]
    const nodemailerAttachments: {
      filename: string
      content: Buffer
      contentType?: string
    }[] = []

    for (const file of attachmentFiles) {
      if (file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer())
        nodemailerAttachments.push({
          filename: file.name,
          content: buffer,
          contentType: file.type || undefined,
        })
      }
    }

    // Send mail
    const fromAddress = process.env.SMTP_USER
    const fromName    = process.env.SMTP_FROM_NAME || 'Aero Aviation'

    await transporter.sendMail({
      from:    `"${fromName}" <${fromAddress}>`,
      to:      to.join(', '),
      cc:      cc?.length ? cc.join(', ') : undefined,
      subject,
      html:    buildHtml(body, subject),
      attachments: nodemailerAttachments.length ? nodemailerAttachments : undefined,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[email/send]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}