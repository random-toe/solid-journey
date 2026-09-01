import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function toDateOnly(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(str) {
  const date = toDateOnly(str)
  if (!date) return ''
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// value: "yyyy-mm-dd" string (or ''), onChange: (str) => void
export default function DatePicker({ value, onChange, placeholder = 'Select a date' }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 288, maxHeight: 400 })
  const selected = toDateOnly(value)
  const [viewDate, setViewDate] = useState(selected || new Date())
  const triggerRef = useRef(null)
  const dropdownRef = useRef(null)

  function updatePosition() {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const width = 288
    const estimatedHeight = 380
    const margin = 12

    let left = rect.left + rect.width / 2 - width / 2
    left = Math.max(margin, Math.min(left, window.innerWidth - width - margin))

    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    let top
    let maxHeight
    if (spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove) {
      // open downward
      top = rect.bottom + 8
      maxHeight = window.innerHeight - top - margin
    } else {
      // not enough room below — open upward instead
      maxHeight = Math.min(estimatedHeight, spaceAbove - 8 - margin)
      top = rect.top - 8 - maxHeight
    }

    setCoords({ top, left, width, maxHeight })
  }

  function handleOpen() {
    updatePosition()
    setOpen((o) => !o)
  }

  useEffect(() => {
    if (!open) return
    updatePosition()

    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  function goToMonth(offset) {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1))
  }

  function handleSelectDay(day) {
    const picked = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    onChange(toDateString(picked))
    setOpen(false)
  }

  function handleToday() {
    const today = new Date()
    setViewDate(today)
    onChange(toDateString(today))
    setOpen(false)
  }

  function handleClear() {
    onChange('')
    setOpen(false)
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isSelected = (day) =>
    selected &&
    selected.getFullYear() === year &&
    selected.getMonth() === month &&
    selected.getDate() === day

  const isToday = (day) => {
    const t = new Date()
    return (
      t.getFullYear() === year && t.getMonth() === month && t.getDate() === day
    )
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="w-full px-4 py-3 rounded-full bg-paper text-ink text-center font-medium border border-ink/15 focus:outline-none focus:ring-2 focus:ring-gold"
      >
        {value ? formatDisplay(value) : (
          <span className="text-ink/40">{placeholder}</span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              width: coords.width,
              maxHeight: coords.maxHeight,
              overflowY: 'auto',
            }}
            className="z-[9999] bg-rose-light border-2 border-rose-dark/30 rounded-2xl shadow-2xl p-4"
          >
            {/* header */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => goToMonth(-1)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-ink/15 text-ink/70 hover:bg-ink/5 hover:text-gold-dark transition-colors"
                aria-label="Previous month"
              >
                ‹
              </button>
              <p className="font-serif text-base text-rose-dark">
                {MONTH_NAMES[month]} {year}
              </p>
              <button
                type="button"
                onClick={() => goToMonth(1)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-ink/15 text-ink/70 hover:bg-ink/5 hover:text-gold-dark transition-colors"
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            {/* day labels */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_LABELS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] uppercase tracking-wide text-rose-dark/60 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* day cells */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) =>
                day === null ? (
                  <div key={`blank-${i}`} />
                ) : (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`h-9 rounded-full text-sm border-2 font-medium transition-colors ${
                      isSelected(day)
                        ? 'bg-gold border-gold text-ink font-semibold'
                        : isToday(day)
                        ? 'border-gold text-gold-dark font-semibold'
                        : 'border-rose-dark/40 text-rose-dark hover:border-rose-dark hover:bg-white/60'
                    }`}
                  >
                    {day}
                  </button>
                )
              )}
            </div>

            {/* footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink/10">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose font-semibold hover:underline"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="text-xs text-gold-dark font-semibold hover:underline"
              >
                Today
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}