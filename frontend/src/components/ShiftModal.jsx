import { useState, useEffect, useRef } from 'react'

const RATE = 585
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

const shiftOptions = [
  {
    key: 'Day',
    icon: '☀️',
    label: 'Day',
    sub: 'Morning shift',
    amount: RATE,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.25)',
    grad: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(251,191,36,0.06))',
  },
  {
    key: 'Night',
    icon: '🌙',
    label: 'Night',
    sub: 'Evening shift',
    amount: RATE,
    color: '#818cf8',
    glow: 'rgba(129,140,248,0.25)',
    grad: 'linear-gradient(135deg, rgba(129,140,248,0.18), rgba(165,180,252,0.06))',
  },
  {
    key: 'Both',
    icon: '⚡',
    label: 'Both',
    sub: 'Double shift',
    amount: RATE * 2,
    color: '#34d399',
    glow: 'rgba(52,211,153,0.25)',
    grad: 'linear-gradient(135deg, rgba(52,211,153,0.18), rgba(110,231,183,0.06))',
  },
  {
    key: 'Off',
    icon: '🏖️',
    label: 'Off Day',
    sub: 'Rest & recharge',
    amount: 0,
    color: '#f87171',
    glow: 'rgba(248,113,113,0.25)',
    grad: 'linear-gradient(135deg, rgba(248,113,113,0.18), rgba(252,165,165,0.06))',
  },
]

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  @keyframes modal-in {
    from { opacity: 0; transform: translateY(24px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes backdrop-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes card-pop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.06); }
    100% { transform: scale(1.04); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1);   }
    50%       { opacity: 0.5; transform: scale(0.7); }
  }

  .sm-backdrop {
    animation: backdrop-in 0.2s ease forwards;
  }
  .sm-panel {
    animation: modal-in 0.32s cubic-bezier(0.34,1.36,0.64,1) forwards;
  }
  .sm-card {
    transition: border-color 0.22s, background 0.22s, box-shadow 0.22s, transform 0.22s;
    cursor: pointer;
    user-select: none;
  }
  .sm-card:hover {
    filter: brightness(1.12);
  }
  .sm-card.active {
    animation: card-pop 0.28s cubic-bezier(0.34,1.36,0.64,1) forwards;
  }
  .sm-save-btn {
    background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%);
    background-size: 200% auto;
    transition: background-position 0.5s, box-shadow 0.2s, opacity 0.2s;
  }
  .sm-save-btn.enabled:hover {
    background-position: right center;
    box-shadow: 0 0 20px rgba(139,92,246,0.5);
  }
  .sm-cancel-btn {
    transition: background 0.18s, color 0.18s;
  }
  .sm-cancel-btn:hover {
    background: rgba(148,163,184,0.1) !important;
    color: #e2e8f0 !important;
  }
  .sm-clear-btn {
    transition: background 0.18s, box-shadow 0.18s;
  }
  .sm-clear-btn:hover {
    background: rgba(248,113,113,0.2) !important;
    box-shadow: 0 0 14px rgba(248,113,113,0.25);
  }
`

export default function ShiftModal({ open, day, month, year, currentShift, onSave, onDelete, onClose }) {
  const [selected, setSelected] = useState(currentShift || null)
  const [prevSelected, setPrevSelected] = useState(null)
  const panelRef = useRef(null)

  useEffect(() => {
    setSelected(currentShift || null)
    setPrevSelected(null)
  }, [currentShift, open])

  if (!open) return null

  const date    = new Date(year, month, day)
  const dayName = DAYS[date.getDay()]
  const dateNum = day
  const monthName = MONTHS[month]

  const selectedOpt = shiftOptions.find(o => o.key === selected)
  const earning = selectedOpt ? `₹${selectedOpt.amount}` : '—'

  const handleSelect = (key) => {
    setPrevSelected(selected)
    setSelected(key)
  }

  return (
    <>
      <style>{styles}</style>

      {/* Backdrop */}
      <div
        className="sm-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2,6,23,0.82)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Syne', sans-serif",
        }}
      >
        {/* Panel */}
        <div
          ref={panelRef}
          className="sm-panel"
          onClick={e => e.stopPropagation()}
          style={{
            background: '#080d1a',
            borderRadius: '22px',
            width: '340px',
            overflow: 'hidden',
            boxShadow: '0 32px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(148,163,184,0.1)',
            position: 'relative',
          }}
        >

          {/* Top accent line */}
          <div style={{
            height: '3px',
            background: selectedOpt
              ? `linear-gradient(90deg, ${selectedOpt.color}00, ${selectedOpt.color}, ${selectedOpt.color}00)`
              : 'linear-gradient(90deg, #6366f100, #6366f1, #6366f100)',
            transition: 'background 0.4s ease',
          }} />

          {/* Header */}
          <div style={{
            padding: '1.6rem 1.6rem 1.2rem',
            borderBottom: '1px solid rgba(148,163,184,0.08)',
          }}>
            {/* Tag */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '100px',
              padding: '3px 10px 3px 8px',
              marginBottom: '14px',
            }}>
              <span style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: '#6366f1',
                display: 'block',
                animation: 'pulse-dot 2s ease-in-out infinite',
              }} />
              <span style={{
                fontSize: '10px',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#818cf8',
                letterSpacing: '0.06em',
                fontWeight: '500',
              }}>
                SHIFT RECORD
              </span>
            </div>

            {/* Date display */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#f8fafc',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                }}>
                  {dayName}
                </div>
                <div style={{
                  fontSize: '13px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#64748b',
                  marginTop: '5px',
                  letterSpacing: '0.02em',
                }}>
                  {monthName} {dateNum}, {year}
                </div>
              </div>

              {/* Earning pill */}
              <div style={{
                textAlign: 'right',
                background: selectedOpt ? `${selectedOpt.glow}` : 'rgba(100,116,139,0.12)',
                border: `1px solid ${selectedOpt ? selectedOpt.color + '40' : 'rgba(100,116,139,0.2)'}`,
                borderRadius: '12px',
                padding: '8px 14px',
                transition: 'all 0.3s ease',
              }}>
                <div style={{
                  fontSize: '10px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: selectedOpt ? selectedOpt.color : '#64748b',
                  letterSpacing: '0.08em',
                  marginBottom: '2px',
                  transition: 'color 0.3s',
                }}>
                  EARNING
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: selectedOpt ? selectedOpt.color : '#475569',
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: 'color 0.3s',
                }}>
                  {earning}
                </div>
              </div>
            </div>
          </div>

          {/* Shift option grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            padding: '1.2rem 1.4rem',
          }}>
            {shiftOptions.map(opt => {
              const isActive = selected === opt.key
              return (
                <div
                  key={opt.key}
                  className={`sm-card${isActive ? ' active' : ''}`}
                  onClick={() => handleSelect(opt.key)}
                  style={{
                    padding: '16px 12px',
                    borderRadius: '14px',
                    border: `1px solid ${isActive ? opt.color + '60' : 'rgba(148,163,184,0.1)'}`,
                    background: isActive ? opt.grad : 'rgba(15,23,42,0.6)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: isActive ? `0 0 0 1px ${opt.color}30, 0 8px 24px ${opt.glow}` : 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: isActive ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                  {/* Active indicator dot */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '6px', height: '6px',
                      borderRadius: '50%',
                      background: opt.color,
                      boxShadow: `0 0 6px ${opt.color}`,
                    }} />
                  )}

                  <span style={{ fontSize: '24px', lineHeight: 1 }}>{opt.icon}</span>

                  <span style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: isActive ? opt.color : '#94a3b8',
                    letterSpacing: '0.01em',
                    transition: 'color 0.22s',
                  }}>
                    {opt.label}
                  </span>

                  <span style={{
                    fontSize: '10px',
                    color: isActive ? opt.color + 'cc' : '#475569',
                    transition: 'color 0.22s',
                    letterSpacing: '0.02em',
                  }}>
                    {opt.sub}
                  </span>

                  <div style={{
                    marginTop: '4px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '11px',
                    fontWeight: '500',
                    color: isActive ? opt.color : '#334155',
                    background: isActive ? `${opt.color}18` : 'rgba(15,23,42,0.5)',
                    border: `1px solid ${isActive ? opt.color + '35' : 'transparent'}`,
                    borderRadius: '6px',
                    padding: '2px 8px',
                    transition: 'all 0.22s',
                  }}>
                    ₹{opt.amount}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'rgba(148,163,184,0.07)',
            margin: '0 1.4rem',
          }} />

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '1.1rem 1.4rem 1.4rem',
          }}>
            <button
              className="sm-cancel-btn"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '11px',
                border: '1px solid rgba(148,163,184,0.15)',
                background: 'transparent',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: "'Syne', sans-serif",
                letterSpacing: '0.02em',
              }}
            >
              Cancel
            </button>

            {currentShift && (
              <button
                className="sm-clear-btn"
                onClick={onDelete}
                style={{
                  padding: '11px 14px',
                  borderRadius: '11px',
                  border: '1px solid rgba(248,113,113,0.3)',
                  background: 'rgba(248,113,113,0.08)',
                  color: '#f87171',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                Clear
              </button>
            )}

            <button
              className={`sm-save-btn${selected ? ' enabled' : ''}`}
              onClick={() => selected && onSave(selected)}
              style={{
                flex: 2,
                padding: '11px',
                borderRadius: '11px',
                border: 'none',
                color: 'white',
                cursor: selected ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                fontWeight: '700',
                fontFamily: "'Syne', sans-serif",
                letterSpacing: '0.03em',
                opacity: selected ? 1 : 0.35,
              }}
            >
              Save Shift
            </button>
          </div>
        </div>
      </div>
    </>
  )
}