import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getMonthShifts, saveShift, deleteShift } from '../utils/api.js'
import { generateMonthlyPDF } from '../utils/pdfExport.js'
import Calendar from '../components/Calendar.jsx'
import ShiftModal from '../components/ShiftModal.jsx'


const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

const SHIFT_COLORS  = { Day: '#f59e0b', Night: '#818cf8', Both: '#34d399', Off: '#f87171' }
const SHIFT_BG      = { Day: 'rgba(245,158,11,0.12)', Night: 'rgba(129,140,248,0.12)', Both: 'rgba(52,211,153,0.12)', Off: 'rgba(248,113,113,0.12)' }
const SHIFT_LABELS  = { Day: 'Day Shift', Night: 'Night Shift', Both: 'Day + Night', Off: 'Off Day' }
const SHIFT_ICONS   = { Day: '☀️', Night: '🌙', Both: '⚡', Off: '💤' }
const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function Dashboard() {
  const { user, logout } = useAuth()
  const today = new Date()
  const [currentYear, setCurrentYear]   = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [shifts, setShifts]     = useState([])
  const [summary, setSummary]   = useState({ totalEarnings: 0, workDays: 0, offDays: 0, dayCount: 0, nightCount: 0, bothCount: 0 })
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModalOpen]   = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [animKey, setAnimKey] = useState(0)

  const fetchShifts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getMonthShifts(currentYear, currentMonth)
      setShifts(data.data)
      setSummary(data.summary)
      setAnimKey(k => k + 1)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [currentYear, currentMonth])

  useEffect(() => { fetchShifts() }, [fetchShifts])

  const changeMonth = (dir) => {
    let m = currentMonth + dir, y = currentYear
    if (m < 0)  { m = 11; y-- }
    if (m > 11) { m = 0;  y++ }
    setCurrentMonth(m); setCurrentYear(y)
  }

  const shiftMap = {}
  shifts.forEach(s => { shiftMap[s.day] = s.shift })

  const handleSave = async (shift) => {
    try {
      await saveShift({ year: currentYear, month: currentMonth, day: selectedDay, shift })
      setModalOpen(false); fetchShifts()
    } catch (err) { alert(err.response?.data?.message || 'Failed to save') }
  }

  const handleDelete = async () => {
    try {
      await deleteShift(currentYear, currentMonth, selectedDay)
      setModalOpen(false); fetchShifts()
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete') }
  }

  const earnPct = summary.totalEarnings > 0
    ? Math.min(100, Math.round((summary.workDays / (summary.workDays + summary.offDays || 1)) * 100))
    : 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #0a0e1a;
          --surface:   #111827;
          --surface2:  #1a2236;
          --border:    rgba(255,255,255,0.07);
          --border-hi: rgba(255,255,255,0.14);
          --text:      #e2e8f0;
          --muted:     #64748b;
          --amber:     #f59e0b;
          --amber-dim: rgba(245,158,11,0.15);
          --violet:    #818cf8;
          --green:     #34d399;
          --red:       #f87171;
          --glow:      rgba(245,158,11,0.25);
        }

        .dash {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* ═══════════════════════════════
           HEADER
        ═══════════════════════════════ */
        .header {
          background: rgba(10,14,26,0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          padding: 0 1.5rem;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
          gap: 12px;
        }

        .header::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--amber), transparent);
          opacity: 0.7;
        }

        .brand { display: flex; align-items: center; gap: 10px; min-width: 0; }

        .brand-icon {
          width: 38px; height: 38px;
          background: var(--amber-dim);
          border: 1px solid rgba(245,158,11,0.3);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
          box-shadow: 0 0 16px var(--glow);
        }

        .brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.3px;
          white-space: nowrap;
        }

        /* Show full name by default, hide short */
        .brand-name-short { display: none; }
        .brand-name-full  { display: inline; }

        .brand-welcome {
          font-size: 11px; color: var(--muted);
          font-weight: 500; margin-top: 1px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .header-right {
          display: flex; align-items: center;
          gap: 10px; flex-shrink: 0;
        }

        .month-nav {
          display: flex; align-items: center;
          background: var(--surface2);
          border: 1px solid var(--border-hi);
          border-radius: 10px;
          overflow: hidden;
        }

        .nav-btn {
          width: 34px; height: 34px;
          background: transparent; border: none;
          color: var(--muted); font-size: 18px;
          cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          transition: all 0.15s; line-height: 1;
        }
        .nav-btn:hover { background: var(--border-hi); color: var(--amber); }

        .month-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px; font-weight: 500;
          color: #ffffff;
          padding: 0 10px; height: 34px;
          display: flex; align-items: center;
          border-left: 1px solid var(--border-hi);
          border-right: 1px solid var(--border-hi);
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .signout-btn {
          height: 34px; padding: 0 14px;
          background: transparent;
          border: 1px solid var(--border-hi);
          border-radius: 8px; color: var(--muted);
          font-size: 11px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; letter-spacing: 0.3px;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .signout-btn:hover {
          border-color: var(--red);
          color: var(--red);
          background: rgba(248,113,113,0.07);
        }

        /* ═══════════════════════════════
           HERO STATS BAND
        ═══════════════════════════════ */
        .stats-band {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 1.25rem 1.5rem;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 1px;
          position: relative;
          overflow: hidden;
        }

        .stats-band::before {
          content: '';
          position: absolute;
          top: -40px; left: -40px;
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .stat-card {
          padding: 0 1.5rem;
          position: relative;
          animation: fadeUp 0.4s ease both;
        }
        .stat-card:first-child { padding-left: 0; }
        .stat-card + .stat-card {
          border-left: 1px solid var(--border);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .stat-card:nth-child(2) { animation-delay: 0.05s; }
        .stat-card:nth-child(3) { animation-delay: 0.1s; }

        .stat-eyebrow {
          font-size: 9px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 1.5px;
          color: var(--muted); margin-bottom: 6px;
          display: flex; align-items: center; gap: 6px;
        }

        .stat-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          display: inline-block;
        }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 28px; font-weight: 800;
          line-height: 1; margin-bottom: 6px;
          letter-spacing: -1px;
        }

        .stat-sub {
          font-size: 11px; color: var(--muted);
          font-weight: 500;
        }

        .mini-pills { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 5px; }
        .mini-pill {
          font-family: 'DM Mono', monospace;
          font-size: 9px; font-weight: 500;
          padding: 2px 7px; border-radius: 4px;
          letter-spacing: 0.5px;
        }

        .earn-bar-track {
          height: 3px;
          background: var(--border-hi);
          border-radius: 2px;
          margin-top: 8px;
          overflow: hidden;
        }
        .earn-bar-fill {
          height: 100%; border-radius: 2px;
          background: linear-gradient(90deg, var(--amber), #fcd34d);
          transition: width 0.8s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 0 8px rgba(245,158,11,0.5);
        }

        /* ═══════════════════════════════
           CONTENT AREA
        ═══════════════════════════════ */
        .content {
          padding: 1.25rem 1.5rem;
          max-width: 860px; margin: 0 auto;
        }

        .toolbar {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem; gap: 12px;
          flex-wrap: wrap;
        }

        .section-label {
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 700;
          color: var(--muted); text-transform: uppercase;
          letter-spacing: 2px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-label::before {
          content: '';
          width: 16px; height: 2px;
          background: var(--amber);
          border-radius: 1px;
        }

        .legend { display: flex; gap: 14px; flex-wrap: wrap; }

        .legend-item {
          display: flex; align-items: center;
          gap: 6px; font-size: 11px;
          color: var(--muted); font-weight: 500;
          cursor: default;
        }

        .legend-pip {
          width: 20px; height: 4px;
          border-radius: 2px; flex-shrink: 0;
        }

        .pdf-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 16px;
          background: var(--amber);
          color: #000000;
          border: none; border-radius: 8px;
          font-size: 11px; font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.5px; text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(245,158,11,0.3);
          white-space: nowrap;
        }
        .pdf-btn:hover {
          background: #fcd34d;
          box-shadow: 0 6px 28px rgba(245,158,11,0.45);
          transform: translateY(-1px);
        }
        .pdf-btn:active { transform: translateY(0); }

        .cal-section-label {
          font-size: 10px; font-weight: 600;
          color: var(--muted); text-transform: uppercase;
          letter-spacing: 1.5px; margin-bottom: 0.75rem;
          display: flex; align-items: center; gap: 8px;
        }
        .cal-section-label span {
          display: inline-block;
          width: 3px; height: 12px;
          background: var(--amber); border-radius: 2px;
        }

        .calendar-wrap {
          background: var(--surface);
          border: 1px solid var(--border-hi);
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .calendar-wrap table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .calendar-wrap th,
        .calendar-wrap td {
          min-width: 0;
          word-break: break-word;
        }

        .calendar-wrap .cal-cell,
        .calendar-wrap [class*="day-cell"],
        .calendar-wrap [class*="cal-day"] {
          min-height: 52px;
          font-size: clamp(11px, 2.3vw, 13px);
        }

        .loading-state {
          text-align: center; padding: 4rem;
          color: var(--muted); font-size: 13px;
          display: flex; flex-direction: column;
          align-items: center; gap: 12px;
        }
        .spinner {
          width: 28px; height: 28px;
          border: 2px solid var(--border-hi);
          border-top-color: var(--amber);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ═══════════════════════════════
           DAILY BREAKDOWN
        ═══════════════════════════════ */
        .breakdown-header {
          display: flex; align-items: center;
          justify-content: space-between;
          margin: 2rem 0 0.85rem;
        }

        .breakdown-title {
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 700;
          color: var(--muted); text-transform: uppercase;
          letter-spacing: 2px;
          display: flex; align-items: center; gap: 8px;
        }
        .breakdown-title::before {
          content: '';
          width: 16px; height: 2px;
          background: var(--violet);
          border-radius: 1px;
        }

        .breakdown-count {
          font-family: 'DM Mono', monospace;
          font-size: 10px; font-weight: 500;
          color: var(--muted);
          background: var(--surface2);
          border: 1px solid var(--border);
          padding: 3px 8px; border-radius: 5px;
        }

        .breakdown-list {
          background: var(--surface);
          border: 1px solid var(--border-hi);
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }

        .breakdown-row {
          display: grid;
          grid-template-columns: 60px auto 1fr auto;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.12s;
          position: relative;
        }
        .breakdown-row:last-child { border-bottom: none; }
        .breakdown-row:hover { background: rgba(255,255,255,0.03); }
        .breakdown-row:hover .row-arrow { opacity: 1; transform: translateX(0); }

        .breakdown-row::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          border-radius: 0 2px 2px 0;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .breakdown-row:hover::before { opacity: 1; }

        .row-date {
          font-family: 'DM Mono', monospace;
          font-size: 10px; font-weight: 500;
          color: var(--muted);
        }

        .shift-badge {
          font-size: 8px; font-weight: 700;
          padding: 3px 8px; border-radius: 5px;
          letter-spacing: 1px; text-transform: uppercase;
          white-space: nowrap; flex-shrink: 0;
          display: flex; align-items: center; gap: 4px;
          width: fit-content;
        }

        .row-name {
          font-size: 12px; font-weight: 500; color: var(--text);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          opacity: 0.8;
        }

        .row-right {
          display: flex; align-items: center; gap: 8px;
          justify-content: flex-end;
        }

        .row-earn {
          font-family: 'DM Mono', monospace;
          font-size: 12px; font-weight: 500;
          text-align: right;
        }
        .row-earn.has { color: var(--green); }
        .row-earn.nil { color: rgba(100,116,139,0.4); }

        .row-arrow {
          color: var(--muted); font-size: 10px;
          opacity: 0; transform: translateX(-4px);
          transition: all 0.15s;
        }

        /* ═══════════════════════════════
           RESPONSIVE
        ═══════════════════════════════ */
        @media (max-width: 768px) {
          .stats-band {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto;
            padding: 1rem;
            gap: 1px;
          }
          .stat-card:first-child {
            grid-column: 1 / -1;
            padding-left: 0;
            padding-bottom: 1rem;
            border-left: none;
            border-bottom: 1px solid var(--border);
            padding-right: 0;
          }
          .stat-card:nth-child(2) {
            padding-top: 1rem;
            padding-left: 0;
            border-left: none;
          }
          .stat-card:nth-child(3) {
            padding-top: 1rem;
            border-left: 1px solid var(--border);
          }
          .content { padding: 1rem; }
          .header { padding: 0 1rem; }
        }

        @media (max-width: 480px) {
          .header { padding: 0 0.875rem; height: 54px; }
          .brand-icon { width: 34px; height: 34px; font-size: 16px; }
          .brand-name { font-size: 13px; }
          .brand-welcome { display: none; }
          .month-label { font-size: 10px; padding: 0 7px; }
          .nav-btn { width: 30px; height: 30px; }
          .month-label { height: 30px; }
          .signout-btn { height: 30px; padding: 0 10px; font-size: 10px; }

          /* Switch brand name to CP on mobile */
          .brand-name-full  { display: none; }
          .brand-name-short { display: inline; }

          .stats-band { padding: 0.875rem; }
          .stat-value { font-size: 24px; }

          .content { padding: 0.875rem; }
          .breakdown-row { grid-template-columns: 50px auto 1fr auto; gap: 8px; padding: 10px 12px; }
          .row-name { display: none; }
          .row-arrow { display: none; }

          .pdf-btn { font-size: 10px; padding: 7px 12px; }
          .legend { gap: 10px; }
          .legend-item { font-size: 10px; }
        }

        @media (max-width: 360px) {
          .stats-band { grid-template-columns: 1fr; }
          .stat-card:nth-child(2) { border-left: none; border-top: 1px solid var(--border); }
          .stat-card:nth-child(3) { border-left: none; border-top: 1px solid var(--border); }
          .stat-card:first-child { border-bottom: 1px solid var(--border); }
          .stat-card + .stat-card { padding-left: 0; padding-top: 0.875rem; }
        }
      `}</style>

      <div className="dash">

        {/* ── HEADER ── */}
        <header className="header">
          <div className="brand">
            <div className="brand-icon">🛡️</div>
            <div>
              <div className="brand-name">
                <span className="brand-name-full">CashPilot</span>
                <span className="brand-name-short">CP</span>
              </div>
              <div className="brand-welcome">Welcome back, {user?.name}</div>
            </div>
          </div>
          <div className="header-right">
            <div className="month-nav">
              <button className="nav-btn" onClick={() => changeMonth(-1)}>‹</button>
              <div className="month-label">{MONTHS_SHORT[currentMonth]} {currentYear}</div>
              <button className="nav-btn" onClick={() => changeMonth(1)}>›</button>
            </div>
            <button className="signout-btn" onClick={logout}>Sign Out</button>
          </div>
        </header>

        {/* ── STATS BAND ── */}
        <div className="stats-band" key={animKey}>
          {/* Earnings */}
          <div className="stat-card">
            <div className="stat-eyebrow">
              <span className="stat-dot" style={{ background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
              Total Earned
            </div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              ₹{summary.totalEarnings.toLocaleString('en-IN')}
            </div>
            <div className="stat-sub">{MONTHS[currentMonth]} {currentYear}</div>
            <div className="earn-bar-track">
              <div className="earn-bar-fill" style={{ width: `${earnPct}%` }} />
            </div>
          </div>

          {/* Working Days */}
          <div className="stat-card">
            <div className="stat-eyebrow">
              <span className="stat-dot" style={{ background: '#818cf8', boxShadow: '0 0 6px #818cf8' }} />
              Working Days
            </div>
            <div className="stat-value" style={{ color: '#818cf8' }}>{summary.workDays}</div>
            <div className="mini-pills">
              <span className="mini-pill" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>☀ {summary.dayCount} Day</span>
              <span className="mini-pill" style={{ background: 'rgba(129,140,248,0.12)', color: '#818cf8' }}>🌙 {summary.nightCount} Night</span>
              {summary.bothCount > 0 &&
                <span className="mini-pill" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>⚡ {summary.bothCount} Both</span>
              }
            </div>
          </div>

          {/* Off Days */}
          <div className="stat-card">
            <div className="stat-eyebrow">
              <span className="stat-dot" style={{ background: '#f87171', boxShadow: '0 0 6px #f87171' }} />
              Off Days
            </div>
            <div className="stat-value" style={{ color: '#f87171' }}>{summary.offDays}</div>
            <div className="stat-sub">Marked off this month</div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="content">

          <div className="toolbar">
            <div className="legend">
              {Object.entries(SHIFT_COLORS).map(([label, color]) => (
                <div key={label} className="legend-item">
                  <div className="legend-pip" style={{ background: color }} />
                  {SHIFT_ICONS[label]} {label}
                </div>
              ))}
            </div>
            <button
              className="pdf-btn"
              onClick={() => generateMonthlyPDF(shifts, summary, currentYear, currentMonth, user?.name)}
            >
              ↓ Export PDF
            </button>
          </div>

          <div className="cal-section-label">
            <span />
            Tap any date to record shift
          </div>

          {loading
            ? (
              <div className="loading-state">
                <div className="spinner" />
                Loading shifts…
              </div>
            )
            : (
              <div className="calendar-wrap">
                <Calendar
                  year={currentYear}
                  month={currentMonth}
                  shiftMap={shiftMap}
                  onDayClick={(d) => { setSelectedDay(d); setModalOpen(true) }}
                />
              </div>
            )
          }

          {shifts.length > 0 && (
            <>
              <div className="breakdown-header">
                <div className="breakdown-title">Daily Breakdown</div>
                <div className="breakdown-count">{shifts.length} entries</div>
              </div>

              <div className="breakdown-list">
                {[...shifts].sort((a, b) => a.day - b.day).map(s => {
                  const d = new Date(s.year, s.month, s.day)
                  const color = SHIFT_COLORS[s.shift]
                  const bg    = SHIFT_BG[s.shift]
                  return (
                    <div
                      key={s._id}
                      className="breakdown-row"
                      style={{ '--row-accent': color }}
                      onClick={() => { setSelectedDay(s.day); setModalOpen(true) }}
                    >
                      <span className="row-date">{WD[d.getDay()]} {String(s.day).padStart(2, '0')}</span>
                      <span
                        className="shift-badge"
                        style={{ background: bg, color: color, border: `1px solid ${color}22` }}
                      >
                        {SHIFT_ICONS[s.shift]} {s.shift}
                      </span>
                      <span className="row-name">{SHIFT_LABELS[s.shift]}</span>
                      <div className="row-right">
                        <span className={`row-earn ${s.earnings > 0 ? 'has' : 'nil'}`}>
                          {s.earnings > 0 ? `₹${s.earnings.toLocaleString('en-IN')}` : '—'}
                        </span>
                        <span className="row-arrow">›</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <ShiftModal
        open={modalOpen}
        day={selectedDay}
        month={currentMonth}
        year={currentYear}
        currentShift={selectedDay ? shiftMap[selectedDay] : null}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}