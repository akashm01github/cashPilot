import { useEffect, useState } from "react"

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const RATE = 585

const shiftStyle = {
  Day:   { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.35)', badgeBg: 'rgba(245,158,11,0.18)', badgeColor: '#f59e0b', numColor: '#fcd34d', earnColor: '#f59e0b' },
  Night: { bg: 'rgba(129,140,248,0.10)', border: 'rgba(129,140,248,0.35)', badgeBg: 'rgba(129,140,248,0.18)', badgeColor: '#818cf8', numColor: '#a5b4fc', earnColor: '#818cf8' },
  Both:  { bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.35)', badgeBg: 'rgba(52,211,153,0.18)', badgeColor: '#34d399', numColor: '#6ee7b7', earnColor: '#34d399' },
  Off:   { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.30)', badgeBg: 'rgba(248,113,113,0.18)', badgeColor: '#f87171', numColor: '#fca5a5', earnColor: null },
}

const shiftLabel = { Day: '☀ DAY', Night: '🌙 NGT', Both: '⚡ BOTH', Off: '💤 OFF' }

export default function Calendar({ year, month, shiftMap, onDayClick }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 480)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay    = new Date(year, month, 1).getDay() // 0=Sun … 6=Sat
  const today       = new Date()
  const isToday     = (d) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()

  // Fixed 42-slot grid (6 rows × 7 cols)
  const slots = Array(42).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    slots[firstDay + d - 1] = d
  }

  // Responsive sizing tokens
  const r = isMobile
    ? { numFs: '11px', badgeFs: '6px', earnFs: '7.5px', pad: '5px 2px 4px', gap: '3px', minH: '58px', cellGap: '3px', headerFs: '8px' }
    : { numFs: '13px', badgeFs: '7.5px', earnFs: '9px',   pad: '7px 4px 6px', gap: '4px', minH: '68px', cellGap: '4px', headerFs: '9px' }

  return (
    <div style={{ padding: isMobile ? '8px' : '14px', background: 'transparent' }}>

      {/* ── Weekday header row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: r.cellGap,
        marginBottom: '8px',
      }}>
        {WEEKDAYS.map((wd, i) => (
          <div key={wd} style={{
            textAlign: 'center',
            fontSize: r.headerFs,
            fontWeight: '700',
            fontFamily: "'DM Mono', monospace",
            color: i === 0 || i === 6
              ? 'rgba(248,113,113,0.65)'
              : 'rgba(100,116,139,0.85)',
            padding: '4px 0',
            textTransform: 'uppercase',
            letterSpacing: isMobile ? '0.4px' : '1px',
          }}>
            {/* Show 1 letter on mobile, 3 letters on desktop */}
            {isMobile ? wd[0] : wd}
          </div>
        ))}
      </div>

      {/* ── 42 day slots ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: r.cellGap,
      }}>
        {slots.map((d, idx) => {

          /* ── Empty slot ── */
          if (d === null) {
            return (
              <div
                key={`empty-${idx}`}
                style={{
                  minHeight: r.minH,
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.03)',
                }}
              />
            )
          }

          /* ── Day cell ── */
          const shift = shiftMap[d]
          const ss    = shift ? shiftStyle[shift] : null
          const earn  = shift === 'Day' || shift === 'Night'
            ? RATE
            : shift === 'Both' ? RATE * 2 : null
          const tod   = isToday(d)

          return (
            <div
              key={`day-${d}`}
              onClick={() => onDayClick(d)}
              style={{
                background: ss ? ss.bg : 'rgba(255,255,255,0.02)',
                border: `1px solid ${tod
                  ? '#f59e0b'
                  : ss ? ss.border : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '8px',
                padding: r.pad,
                textAlign: 'center',
                cursor: 'pointer',
                minHeight: r.minH,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: r.gap,
                transition: 'transform 0.13s, background 0.13s, box-shadow 0.13s',
                userSelect: 'none',
                position: 'relative',
                boxSizing: 'border-box',
                overflow: 'hidden',        // ← prevents content spilling outside cell
                boxShadow: tod
                  ? '0 0 0 1px rgba(245,158,11,0.4), 0 0 12px rgba(245,158,11,0.15)'
                  : 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.06)'
                e.currentTarget.style.background = ss ? ss.bg : 'rgba(255,255,255,0.05)'
                e.currentTarget.style.boxShadow = tod
                  ? '0 0 0 1px rgba(245,158,11,0.6), 0 0 18px rgba(245,158,11,0.25)'
                  : ss
                    ? `0 0 0 1px ${ss.border}, 0 4px 16px rgba(0,0,0,0.3)`
                    : '0 4px 16px rgba(0,0,0,0.25)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.background = ss ? ss.bg : 'rgba(255,255,255,0.02)'
                e.currentTarget.style.boxShadow = tod
                  ? '0 0 0 1px rgba(245,158,11,0.4), 0 0 12px rgba(245,158,11,0.15)'
                  : 'none'
              }}
            >
              {/* Today glow dot */}
              {tod && (
                <div style={{
                  position: 'absolute',
                  top: '4px', right: '4px',
                  width: '5px', height: '5px',
                  borderRadius: '50%',
                  background: '#f59e0b',
                  boxShadow: '0 0 6px #f59e0b',
                }} />
              )}

              {/* Day number */}
              <span style={{
                fontSize: r.numFs,
                fontWeight: '700',
                fontFamily: "'DM Mono', monospace",
                color: ss
                  ? ss.numColor
                  : tod ? '#f59e0b' : 'rgba(226,232,240,0.5)',
                lineHeight: 1,
                // ensure number never overflows
                width: '100%',
                textAlign: 'center',
              }}>
                {d}
              </span>

              {/* Shift badge */}
              {shift && (
                <span style={{
                  fontSize: r.badgeFs,
                  fontWeight: '700',
                  padding: isMobile ? '1px 3px' : '2px 5px',
                  borderRadius: '4px',
                  background: ss.badgeBg,
                  color: ss.badgeColor,
                  letterSpacing: '0.3px',
                  border: `1px solid ${ss.border}`,
                  lineHeight: 1.4,
                  whiteSpace: 'nowrap',
                  // shrink text to fit narrow cells on mobile
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {isMobile
                    ? (shift === 'Day' ? '☀' : shift === 'Night' ? '🌙' : shift === 'Both' ? '⚡' : '💤')
                    : shiftLabel[shift]}
                </span>
              )}

              {/* Earnings */}
              {earn && (
                <span style={{
                  fontSize: r.earnFs,
                  fontWeight: '600',
                  color: ss.earnColor,
                  fontFamily: "'DM Mono', monospace",
                  opacity: 0.9,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}>
                  {/* {isMobile ? `₹${earn >= 1000 ? (earn/1000).toFixed(earn%1000===0?0:1)+'k' : earn}` : `₹${earn}`} */}
                  ₹{earn.toLocaleString()}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}