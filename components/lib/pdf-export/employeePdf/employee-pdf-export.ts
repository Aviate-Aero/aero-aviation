import jsPDF from 'jspdf'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmployeeForPDF {
  employee_id: string
  full_name: string
  email: string | null
  phone: string | null
  department: string
  role: string
  joining_date: string | null
  date_of_birth: string | null
  status: string
  salary: number | null
  salary_currency: string | null
  photo_url: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fetch URL → base64 */
async function urlToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror  = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/**
 * Ensures an image is in a raster format supported by jsPDF (PNG/JPEG).
 * If the input is SVG, it converts it to PNG using a canvas.
 */
async function ensureRasterImage(base64: string): Promise<string> {
  if (!base64.startsWith('data:image/svg+xml')) {
    // Already a raster format
    return base64
  }

  if (typeof window === 'undefined') {
    // Server‑side fallback – cannot convert, return as is (jsPDF may still fail)
    return base64
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      // Set a reasonable width for the rasterised logo (e.g., 400px)
      const targetWidth = 400
      const scale = targetWidth / img.width
      canvas.width = targetWidth
      canvas.height = img.height * scale

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Failed to load SVG for conversion'))
    img.src = base64
  })
}

/**
 * Draws the image through a canvas so the browser normalises EXIF orientation.
 * This fixes the "tilted photo" issue with phone‑taken pictures.
 */
async function fixOrientation(base64: string): Promise<string> {
  if (typeof window === 'undefined') return base64
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(base64); return }
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/jpeg', 0.92))
    }
    img.onerror = () => resolve(base64)
    img.src = base64
  })
}

/**
 * Clips image to a rounded rectangle via canvas.
 * cornerFraction: fraction of shortest side used as corner radius (default 10%).
 */
async function applyRoundedCorners(base64: string, cornerFraction = 0.1): Promise<string> {
  if (typeof window === 'undefined') return base64
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(base64); return }
      const r = Math.min(w, h) * cornerFraction
      ctx.beginPath()
      ctx.moveTo(r, 0)
      ctx.lineTo(w - r, 0)
      ctx.quadraticCurveTo(w, 0, w, r)
      ctx.lineTo(w, h - r)
      ctx.quadraticCurveTo(w, h, w - r, h)
      ctx.lineTo(r, h)
      ctx.quadraticCurveTo(0, h, 0, h - r)
      ctx.lineTo(0, r)
      ctx.quadraticCurveTo(0, 0, r, 0)
      ctx.closePath()
      // White fill before clip so JPEG corners are white (not black/transparent)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.clip()
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/jpeg', 0.88))
    }
    img.onerror = () => resolve(base64)
    img.src = base64
  })
}

/** Fetch, fix EXIF orientation, and apply rounded corners */
async function loadPhotoRounded(url: string, cornerFraction = 0.1): Promise<string | null> {
  const raw = await urlToBase64(url)
  if (!raw) return null
  const fixed = await fixOrientation(raw)
  return applyRoundedCorners(fixed, cornerFraction)
}

/** Fetch an employee photo and fix its orientation (for profile PDF) */
async function loadPhoto(url: string): Promise<string | null> {
  const raw = await urlToBase64(url)
  if (!raw) return null
  return fixOrientation(raw)
}

const CURRENCY_SYM: Record<string, string> = { PKR: '₨', USD: '$', QAR: 'QR' }

// ─── Employee Profile PDF ─────────────────────────────────────────────────────

export async function downloadEmployeePDF(employee: EmployeeForPDF): Promise<void> {
  const doc  = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const W    = 210
  const M    = 16
  const IW   = W - M * 2

  type RGB = [number,number,number]
  const navy:  RGB = [8,  32, 72]
  const blue:  RGB = [26, 86,175]
  const sky:   RGB = [56,130,220]
  const pageBg:RGB = [247,249,253]
  const white: RGB = [255,255,255]
  const dark:  RGB = [18, 22, 38]
  const mid:   RGB = [75, 88,115]
  const muted: RGB = [140,152,175]
  const line:  RGB = [218,225,238]
  const cardBg:RGB = [255,255,255]

  doc.setFillColor(...pageBg)
  doc.rect(0, 0, W, 297, 'F')

  doc.setFillColor(...navy)
  doc.rect(0, 0, W, 44, 'F')
  doc.setFillColor(...blue)
  doc.rect(W - 3, 0, 3, 44, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...white)
  doc.text('Flight Core Intelligence Human Resource Management', M, 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(160, 185, 225)
  doc.text('Official Employee Record', M, 25)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...white)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(160, 185, 225)
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  doc.text(`Generated: ${today}`, W - M, 25, { align: 'right' })

  const pCardY = 50
  const pCardH = 72
  doc.setFillColor(...cardBg)
  doc.roundedRect(M, pCardY, IW, pCardH, 3, 3, 'F')
  doc.setDrawColor(...line)
  doc.setLineWidth(0.3)
  doc.roundedRect(M, pCardY, IW, pCardH, 3, 3, 'S')
  doc.setFillColor(...blue)
  doc.roundedRect(M, pCardY, 3, pCardH, 1.5, 1.5, 'F')

  const pW = 42, pH = 52
  const pX = M + 10, pY = pCardY + (pCardH - pH) / 2

  let photoLoaded = false
  if (employee.photo_url) {
    const img = await loadPhoto(employee.photo_url)
    if (img) {
      try {
        doc.setFillColor(...white)
        doc.setDrawColor(...line)
        doc.setLineWidth(0.5)
        doc.rect(pX - 1, pY - 1, pW + 2, pH + 2, 'FD')
        doc.addImage(img, 'JPEG', pX, pY, pW, pH)
        photoLoaded = true
      } catch { /* ignore */ }
    }
  }
  if (!photoLoaded) {
    doc.setFillColor(...blue)
    doc.rect(pX, pY, pW, pH, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(28)
    doc.setTextColor(...white)
    doc.text(employee.full_name.charAt(0).toUpperCase(), pX + pW / 2, pY + pH / 2 + 5, { align: 'center' })
  }

  const nX = pX + pW + 12

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(...dark)
  doc.text(employee.full_name, nX, pCardY + 16)

  const maxRoleWidth = IW - (nX - M) - 4   // available width for role text

  const fitText = (
    text: string,
    maxWidth: number,
    initialFontSize: number,
    minFontSize: number = 6
  ): { fontSize: number; lines: string[] } => {
    doc.setFont('helvetica', 'normal')
    let fontSize = initialFontSize
    doc.setFontSize(fontSize)
    let textWidth = doc.getTextWidth(text)

    // Reduce font size until it fits or we hit the minimum
    while (textWidth > maxWidth && fontSize > minFontSize) {
      fontSize -= 0.5
      doc.setFontSize(fontSize)
      textWidth = doc.getTextWidth(text)
    }

    // If still too wide, split into two lines by wrapping at spaces
    if (textWidth > maxWidth) {
      const words = text.split(' ')
      let line1 = ''
      let line2 = ''
      for (const word of words) {
        const testLine = line1 ? `${line1} ${word}` : word
        if (doc.getTextWidth(testLine) <= maxWidth) {
          line1 = testLine
        } else {
          line2 = line2 ? `${line2} ${word}` : word
        }
      }
      return { fontSize, lines: [line1, line2 || ''] }
    }

    return { fontSize, lines: [text] }
  }

  const roleResult = fitText(employee.role, maxRoleWidth, 9.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(roleResult.fontSize)
  doc.setTextColor(...mid)

  if (roleResult.lines.length === 1) {
    doc.text(roleResult.lines[0], nX, pCardY + 24)
  } else {
    // Two lines – adjust vertical positions to avoid overlap
    doc.text(roleResult.lines[0], nX, pCardY + 22)
    doc.text(roleResult.lines[1], nX, pCardY + 29)
  }

  // Department (unchanged)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...blue)
  doc.text(employee.department, nX, pCardY + 32)

  // Employee ID badge
  doc.setFillColor(...navy)
  doc.roundedRect(nX, pCardY + 47, 54, 14, 2, 2, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(160, 185, 225)
  doc.text('EMPLOYEE ID', nX + 27, pCardY + 53, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...white)
  doc.text(employee.employee_id, nX + 27, pCardY + 57, { align: 'center' })

  let y = pCardY + pCardH + 8

  const section = (title: string, rows: Array<[string, string, string, string] | [string, string]>) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...sky)
    doc.text(title.toUpperCase(), M, y + 4)
    doc.setDrawColor(...sky)
    doc.setLineWidth(0.3)
    doc.line(M + doc.getTextWidth(title.toUpperCase()) + 3, y + 1.5, M + IW, y + 1.5)
    y += 8

    const rowH = 10
    rows.forEach((row, i) => {
      const bg: RGB = i % 2 === 0 ? cardBg : pageBg
      doc.setFillColor(...bg)
      doc.rect(M, y, IW, rowH, 'F')

      if (row.length === 4) {
        const [lLabel, lVal, rLabel, rVal] = row
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(...muted)
        doc.text(lLabel, M + 4, y + 7)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(...dark)
        doc.text(lVal || '—', M + 48, y + 7)
        doc.setDrawColor(...line)
        doc.setLineWidth(0.25)
        doc.line(W / 2, y + 2, W / 2, y + rowH - 2)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(...muted)
        doc.text(rLabel, W / 2 + 6, y + 7)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(...dark)
        doc.text(rVal || '—', W / 2 + 50, y + 7)
      } else {
        const [lLabel, lVal] = row
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(...muted)
        doc.text(lLabel, M + 4, y + 7)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(...dark)
        doc.text(lVal || '—', M + 48, y + 7)
      }

      doc.setDrawColor(...line)
      doc.setLineWidth(0.2)
      doc.line(M, y + rowH, M + IW, y + rowH)
      y += rowH
    })
    y += 6
  }

  section('Contact Information', [
    ['Email Address', employee.email ?? '—', 'Phone Number', employee.phone ?? '—'],
  ])

  const joinDate = employee.joining_date
    ? new Date(employee.joining_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  const dobDate = employee.date_of_birth
    ? new Date(employee.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  section('Employment Details', [
    ['Department', employee.department,  'Job Title', employee.role],
    ['Joining Date', joinDate, 'Date of Birth', dobDate],
  ])

  if (employee.salary != null && employee.salary_currency) {
    const sym = CURRENCY_SYM[employee.salary_currency] ?? ''
    section('Compensation', [
      ['Monthly Salary', `${sym} ${employee.salary.toLocaleString()}`, 'Currency', employee.salary_currency],
    ])
  }

  y += 4
  doc.setFillColor(...cardBg)
  doc.setDrawColor(...line)
  doc.setLineWidth(0.3)
  doc.roundedRect(M, y, IW, 30, 2, 2, 'FD')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...muted)
  doc.line(M + 8,       y + 22, M + 64,        y + 22)
  doc.line(M + IW - 56, y + 22, M + IW - 8,    y + 22)
  doc.text('Authorised Signature', M + 8, y + 27)
  doc.text('Date', M + IW - 56, y + 27)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(...muted)

  doc.setFillColor(...navy)
  doc.rect(0, 285, W, 12, 'F')
  doc.setFillColor(...blue)
  doc.rect(0, 285, 4, 12, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(160, 185, 225)
  doc.text('Flight Core Intelligence', M, 292.5)
  doc.text('Confidential — Internal Use Only', W / 2, 292.5, { align: 'center' })
  doc.text('Page 1 of 1', W - M, 292.5, { align: 'right' })

  doc.save(`${employee.employee_id}_${employee.full_name.replace(/\s+/g, '_')}_Profile.pdf`)
}

// ─── ID Card shared palette ───────────────────────────────────────────────────

type RGB = [number, number, number]
const ID_NAVY:  RGB = [8,  32, 72]
const ID_BLUE:  RGB = [26, 86,175]
const ID_WHITE: RGB = [255,255,255]
const ID_DARK:  RGB = [18, 22, 38]
const ID_MID:   RGB = [75, 88,115]
const ID_MUTED: RGB = [140,152,175]
const ID_LINE:  RGB = [218,225,238]
const ID_BG:    RGB = [247,249,253]

// ─── Employee ID Card — FRONT ─────────────────────────────────────────────────

export async function downloadEmployeeIDCardFront(employee: EmployeeForPDF): Promise<void> {
  const W = 86
  const H = 142
  const doc = new jsPDF({ unit: 'mm', format: [W, H], orientation: 'portrait' })
  const cx = W / 2

  // ── Card background ───────────────────────────────────────────────────────
  doc.setFillColor(...ID_WHITE)
  doc.rect(0, 0, W, H, 'F')

  // ── Navy header ───────────────────────────────────────────────────────────
  const headerH = 28
  doc.setFillColor(...ID_NAVY)
  doc.rect(0, 0, W, headerH, 'F')
  doc.setFillColor(...ID_BLUE)
  doc.rect(0, headerH - 2, W, 2, 'F')

  // Logo
  const logoB64 = await urlToBase64(
    typeof window !== 'undefined'
      ? `${window.location.origin}/logos/officialLogo.svg`
      : '/logos/officialLogo.svg'
  )
  if (logoB64) {
    try {
      // Convert SVG to PNG if necessary
      const rasterLogo = await ensureRasterImage(logoB64)
      const lH = 24, lW = 24
      const logoY = (headerH - lH) / 2 - 5
      doc.addImage(rasterLogo, 'PNG', (W - lW) / 2, logoY, lW, lH)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(160, 185, 225)
      doc.text('ME', cx, logoY + lH + 0.5, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(160, 185, 225)
      doc.text('Aviation Company', cx, logoY + lH + 4, { align: 'center' })
    } catch (err) {
      console.warn('Logo conversion failed, using fallback text', err)
      // Fallback to text if conversion fails
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(...ID_WHITE)
      doc.text('Aero Aviation', cx, headerH / 2, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(160, 185, 225)
      doc.text('Aviation Company', cx, headerH / 2 + 4, { align: 'center' })
    }
  } else {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...ID_WHITE)
    doc.text('Aero Aviation', cx, headerH / 2, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(160, 185, 225)
    doc.text('Aviation Company', cx, headerH / 2 + 4, { align: 'center' })
  }

  // ── Photo ─────────────────────────────────────────────────────────────────
  const pW = 36, pH = 44
  const pX = (W - pW) / 2
  const pY = headerH + 6

  let photoLoaded = false
  if (employee.photo_url) {
    const img = await loadPhotoRounded(employee.photo_url, 0.1)
    if (img) {
      try {
        doc.setFillColor(195, 208, 230)
        doc.roundedRect(pX + 1.5, pY + 1.5, pW, pH, 2.5, 2.5, 'F')
        doc.addImage(img, 'PNG', pX, pY, pW, pH)
        photoLoaded = true
      } catch { /* ignore */ }
    }
  }
  if (!photoLoaded) {
    doc.setFillColor(230, 238, 252)
    doc.setDrawColor(...ID_LINE)
    doc.setLineWidth(0.3)
    doc.roundedRect(pX, pY, pW, pH, 2.5, 2.5, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(...ID_BLUE)
    doc.text(employee.full_name.charAt(0).toUpperCase(), cx, pY + pH / 2 + 4, { align: 'center' })
  }

  // ── Name & Role ───────────────────────────────────────────────────────────
  let y = pY + pH + 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...ID_DARK)
  doc.text(employee.full_name, cx, y, { align: 'center', maxWidth: W - 10 })
  y += 5.5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...ID_MID)
  doc.text(employee.role, cx, y, { align: 'center', maxWidth: W - 10 })
  y += 5

  // Status pill removed as per the original code (not used)
  y += 9.5

  // ── Info table ────────────────────────────────────────────────────────────
  const tX = 6, tW = W - 12, cH = 8, col1 = tW / 2

  const tableRow = (label: string, value: string, shade = false) => {
    doc.setFillColor(...(shade ? ID_BG : ID_WHITE))
    doc.setDrawColor(...ID_LINE)
    doc.setLineWidth(0.25)
    doc.rect(tX, y, tW, cH, 'FD')
    doc.line(tX + col1, y, tX + col1, y + cH)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5.8)
    doc.setTextColor(...ID_MUTED)
    doc.text(label, tX + col1 / 2, y + cH / 2 + 1.3, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...ID_DARK)
    doc.text(value || '—', tX + col1 + (tW - col1) / 2, y + cH / 2 + 1.3, { align: 'center' })
    y += cH
  }

  tableRow('EMPLOYEE ID', employee.employee_id, false)
  tableRow('DEPARTMENT',  employee.department,   true)
  tableRow('JOINING DATE',
    employee.joining_date
      ? new Date(employee.joining_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—',
    false
  )

  // ── Footer — crew vs standard ─────────────────────────────────────────────
  const CREW_DEPTS = new Set(['Operations', 'Cabin Crew', 'Ground Crew', 'Dispatch'])
  const isCrewMember = CREW_DEPTS.has(employee.department)

  if (isCrewMember) {
    const footerY = H - 11
    doc.setFillColor(...ID_NAVY)
    doc.rect(0, footerY, W, 11, 'F')
    doc.setFillColor(...ID_BLUE)
    doc.rect(0, footerY, W, 1.5, 'F')

    const textCx = (W - 17) / 2
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setCharSpace(1)
    doc.setTextColor(...ID_WHITE)
    doc.text('CREW MEMBER', textCx, footerY + 7, { align: 'center' })
    doc.setCharSpace(0)

    const sR = 7, sCx = W - 10, sCy = H - 10
    doc.setFillColor(...ID_WHITE)
    doc.circle(sCx, sCy, sR, 'F')
    doc.setDrawColor(...ID_NAVY)
    doc.setLineWidth(0.7)
    doc.circle(sCx, sCy, sR, 'S')
    doc.setLineWidth(0.3)
    doc.circle(sCx, sCy, sR - 2, 'S')
    for (let angle = 0; angle < 360; angle += 15) {
      const rad = (angle * Math.PI) / 180
      doc.setFillColor(...ID_NAVY)
      doc.circle(
        sCx + (sR - 1) * Math.cos(rad),
        sCy + (sR - 1) * Math.sin(rad),
        0.22, 'F'
      )
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(...ID_NAVY)
    doc.text('CREW', sCx, sCy + 1.2, { align: 'center' })
    doc.setDrawColor(...ID_NAVY)
    doc.setLineWidth(0.3)
    doc.line(sCx - 3, sCy - 2, sCx + 3, sCy - 2)
    doc.line(sCx - 3, sCy + 2.5, sCx + 3, sCy + 2.5)
  } else {
    y += 5
    doc.setDrawColor(...ID_LINE)
    doc.setLineWidth(0.25)
    doc.line(tX, y, W - tX, y)
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.5)
    doc.setTextColor(...ID_MUTED)
  }

  // ── Outer card border ─────────────────────────────────────────────────────
  doc.setDrawColor(...ID_LINE)
  doc.setLineWidth(0.5)
  doc.roundedRect(0.5, 0.5, W - 1, H - 1, 3, 3, 'S')

  doc.save(`${employee.employee_id}_${employee.full_name.replace(/\s+/g, '_')}_IDCard_Front.pdf`)
}

// ─── Employee ID Card — BACK ──────────────────────────────────────────────────

export async function downloadEmployeeIDCardBack(employee: EmployeeForPDF): Promise<void> {
  const W = 86
  const H = 142
  const doc = new jsPDF({ unit: 'mm', format: [W, H], orientation: 'portrait' })
  const cx = W / 2
  const bX = 8
  const bW = W - 16

  // ── Card background ───────────────────────────────────────────────────────
  doc.setFillColor(...ID_WHITE)
  doc.rect(0, 0, W, H, 'F')

  // ── Navy header ───────────────────────────────────────────────────────────
  const headerH = 40
  doc.setFillColor(...ID_NAVY)
  doc.rect(0, 0, W, headerH, 'F')
  doc.setFillColor(...ID_BLUE)
  doc.rect(0, headerH - 2, W, 2, 'F')

  // Logo in header
  const logoB64 = await urlToBase64(
    typeof window !== 'undefined'
      ? `${window.location.origin}/logos/officialLogo.svg`
      : '/logos/officialLogo.svg'
  )
  if (logoB64) {
    try {
      const rasterLogo = await ensureRasterImage(logoB64)
      const lH = 24, lW = 24
      const logoY = (headerH - lH) / 2 - 5
      doc.addImage(rasterLogo, 'PNG', (W - lW) / 2, logoY, lW, lH)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(160, 185, 225)
      doc.text('ME', cx, logoY + lH + 0.5, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(160, 185, 225)
      doc.text('Aviation Company', cx, logoY + lH + 4, { align: 'center' })
    } catch (err) {
      console.warn('Logo conversion failed, using fallback text', err)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...ID_WHITE)
      doc.text('Aero Aviation', cx, headerH / 2, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(5)
      doc.setTextColor(160, 185, 225)
      doc.text('Aviation Company', cx, headerH / 2 + 4, { align: 'center' })
    }
  } else {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...ID_WHITE)
    doc.text('Aero Aviation', cx, headerH / 2, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5)
    doc.setTextColor(160, 185, 225)
    doc.text('Aviation Company', cx, headerH / 2 + 4, { align: 'center' })
  }

  // ── "IF FOUND" section ────────────────────────────────────────────────────
  let y = headerH + 12

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...ID_MUTED)
  doc.text('IF FOUND, PLEASE RETURN TO:', cx, y, { align: 'center' })
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...ID_NAVY)
  doc.text('Aero Aviation', cx, y, { align: 'center' })
  y += 5

  doc.setDrawColor(...ID_BLUE)
  doc.setLineWidth(0.8)
  doc.line(cx - 14, y, cx + 14, y)
  y += 9

  const boxRadius = 2
  const boxH = 24 // increased height to fit longer address

  // UK OFFICE box
  doc.setFillColor(...ID_BG)
  doc.setDrawColor(...ID_LINE)
  doc.setLineWidth(0.25)
  doc.roundedRect(bX, y, bW, boxH, boxRadius, boxRadius, 'FD')
  doc.setFillColor(...ID_BLUE)
  doc.roundedRect(bX, y, 2.5, boxH, boxRadius, boxRadius, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.8)
  doc.setTextColor(...ID_BLUE)
  doc.text('UK OFFICE', bX + 7, y + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...ID_DARK)
  // Split address into two lines to fit nicely
  doc.text('Office 5170m, 3 Fitzroy Place, 1/1', bX + 7, y + 10.5)
  doc.text('Sauchiehall Street, Finnieston', bX + 7, y + 15)
  doc.text('Glasgow Central, G3 7RH', bX + 7, y + 19.5)

  y += boxH + 4

  // Email box (no second office)
  const emailBoxH = 13
  doc.setFillColor(...ID_BG)
  doc.setDrawColor(...ID_LINE)
  doc.setLineWidth(0.25)
  doc.roundedRect(bX, y, bW, emailBoxH, boxRadius, boxRadius, 'FD')
  doc.setFillColor(...ID_BLUE)
  doc.roundedRect(bX, y, 2.5, emailBoxH, boxRadius, boxRadius, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.8)
  doc.setTextColor(...ID_BLUE)
  doc.text('EMAIL', bX + 7, y + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...ID_DARK)
  doc.text('info@aeroaviation.me', bX + 7, y + 10.5)

  y += emailBoxH + 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(4.8)
  doc.setTextColor(...ID_MUTED)
  doc.text('This card is the property of Aero Aviation. Unauthorized use is prohibited.', cx, y, { align: 'center', maxWidth: bW })

  // ── Outer card border ─────────────────────────────────────────────────────
  doc.setDrawColor(...ID_LINE)
  doc.setLineWidth(0.5)
  doc.roundedRect(0.5, 0.5, W - 1, H - 1, 3, 3, 'S')

  doc.save(`${employee.employee_id}_${employee.full_name.replace(/\s+/g, '_')}_IDCard_Back.pdf`)
}