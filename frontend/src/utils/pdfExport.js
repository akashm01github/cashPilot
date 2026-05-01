import jsPDF from 'jspdf'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const SHIFT_NAMES = { Day: 'Day Shift', Night: 'Night Shift', Both: 'Day + Night Shift', Off: 'Off Day' }
const RATE = 585

// jsPDF's built-in helvetica does not include the ₹ glyph.
// Use "Rs." as a safe ASCII fallback that always renders correctly.
const RS = 'Rs.'

export const generateMonthlyPDF = (shifts, summary, year, month, userName) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = 210
  const margin = 14
  const contentW = w - margin * 2   // 182 mm

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(0, 0, 0)
  doc.rect(0, 0, w, 45, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('INCOME TRACKER', margin, 16)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(210, 210, 210)
  doc.text(`Monthly Report - ${MONTHS[month]} ${year}`, margin, 25)
  doc.text(`Officer: ${userName}`, margin, 32)

  doc.setFontSize(8)
  doc.setTextColor(180, 180, 180)
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`,
    margin, 40
  )

  // ── Summary cards ─────────────────────────────────────────────────────────
  let y = 54
  const cardH = 26
  const gap   = 8
  const cardW = (contentW - gap * 2) / 3   // three equal cards

  const cards = [
    { label: 'TOTAL EARNED', value: RS + ' ' + summary.totalEarnings.toLocaleString('en-IN') },
    { label: 'WORKING DAYS', value: String(summary.workDays) },
    { label: 'OFF DAYS',     value: String(summary.offDays) },
  ]

  cards.forEach((card, i) => {
    const x = margin + i * (cardW + gap)
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F')
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'S')

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.text(card.value, x + cardW / 2, y + 14, { align: 'center' })

    doc.setTextColor(90, 90, 90)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(card.label, x + cardW / 2, y + 22, { align: 'center' })
  })

  y += cardH + 8

  // ── Sub-info row (plain white background, bordered) ───────────────────────
  const subH = 10
  doc.setFillColor(255, 255, 255)
  doc.rect(margin, y, contentW, subH, 'F')
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.4)
  doc.rect(margin, y, contentW, subH, 'S')

  doc.setTextColor(40, 40, 40)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `Day: ${summary.dayCount}   |   Night: ${summary.nightCount}   |   Both: ${summary.bothCount}   |   Rate per shift: ${RS} ${RATE}`,
    w / 2, y + 7, { align: 'center' }
  )

  y += subH + 6

  // ── Column x-positions ────────────────────────────────────────────────────
  // Total usable width = 182 mm; keep all columns well inside right margin
  const cols = {
    date:    margin + 3,      // ~17
    weekday: margin + 35,     // ~49
    shift:   margin + 72,     // ~86
    rate:    margin + 120,    // ~134
    earned:  margin + 153,    // ~167  (right edge = margin+contentW-5 = ~191)
  }

  // ── Table header draw helper ──────────────────────────────────────────────
  const hdrH = 10
  const drawHeader = (atY) => {
    doc.setFillColor(0, 0, 0)
    doc.rect(margin, atY, contentW, hdrH, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('DATE',        cols.date,    atY + 7)
    doc.text('WEEKDAY',     cols.weekday, atY + 7)
    doc.text('SHIFT TYPE',  cols.shift,   atY + 7)
    doc.text('RATE/SHIFT',  cols.rate,    atY + 7)
    doc.text('EARNED',      cols.earned,  atY + 7)
  }

  drawHeader(y)
  y += hdrH

  // ── Table rows ────────────────────────────────────────────────────────────
  const rowH  = 10
  const sorted = [...shifts].sort((a, b) => a.day - b.day)

  sorted.forEach((shift, idx) => {
    // Reserve 30 mm at bottom for footer
    if (y + rowH > 267) {
      doc.addPage()
      y = 20
      drawHeader(y)
      y += hdrH
    }

    const d     = new Date(shift.year, shift.month, shift.day)
    const isOff = shift.shift === 'Off'

    // Alternating white / very light grey — no strong tint
    doc.setFillColor(...(idx % 2 === 0 ? [248, 248, 248] : [255, 255, 255]))
    doc.rect(margin, y, contentW, rowH, 'F')

    // Row separator
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.2)
    doc.line(margin, y + rowH, margin + contentW, y + rowH)

    const textY = y + 7
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(20, 20, 20)

    doc.text(
      `${String(shift.day).padStart(2, '0')} ${MONTHS[shift.month].substring(0, 3)} ${shift.year}`,
      cols.date, textY
    )
    doc.text(WEEKDAYS[d.getDay()], cols.weekday, textY)
    doc.text(SHIFT_NAMES[shift.shift], cols.shift, textY)

    if (!isOff) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(40, 40, 40)
      doc.text(`${RS} ${RATE}`, cols.rate, textY)

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(`${RS} ${shift.earnings}`, cols.earned, textY)
    } else {
      doc.setTextColor(180, 180, 180)
      doc.text('-', cols.rate,   textY)
      doc.text('-', cols.earned, textY)
    }

    y += rowH
  })

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerH = 18

  if (y + 6 + footerH > 287) {
    doc.addPage()
    y = 20
  }

  y += 5

  // Divider line
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.6)
  doc.line(margin, y, margin + contentW, y)
  y += 4

  // Black box
  doc.setFillColor(0, 0, 0)
  doc.rect(margin, y, contentW, footerH, 'F')

  const midY = y + footerH / 2 + 3.5

  // Label — left, font 10
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL MONTHLY EARNINGS', margin + 5, midY)

  // Amount — right-aligned, keep a 6 mm inner margin from the box edge
  doc.setFontSize(12)
  doc.text(
    `${RS} ${summary.totalEarnings.toLocaleString('en-IN')}`,
    margin + contentW - 6,   // 6 mm from right edge of box
    midY,
    { align: 'right' }
  )

  doc.save(`Security_Income_${MONTHS[month]}_${year}.pdf`)
}