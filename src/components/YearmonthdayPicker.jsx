import { useState } from 'react'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// How far back/forward the year dropdown goes. Wide enough to cover
// birthdates as well as anniversary dates.
const CURRENT_YEAR = new Date().getFullYear()
const MIN_YEAR = CURRENT_YEAR - 80
const MAX_YEAR = CURRENT_YEAR + 5

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

// A small "jump straight to a date" panel — three dropdowns (year, month,
// day) instead of clicking ‹ › one month at a time. Lives in its own file
// so the year/month/day logic can be tested and fixed independently of
// the calendar-grid logic in DatePicker.jsx.
//
// Props:
//   initialDate: Date  — what to prefill the dropdowns with
//   onSelect: (date: Date) => void  — called when the user confirms
//   onCancel: () => void
export default function YearMonthDayPicker({ initialDate, onSelect, onCancel }) {
  const [year, setYear] = useState(initialDate.getFullYear())
  const [month, setMonth] = useState(initialDate.getMonth())
  const [day, setDay] = useState(initialDate.getDate())

  const maxDay = daysInMonth(year, month)
  const safeDay = Math.min(day, maxDay)

  const years = []
  for (let y = MAX_YEAR; y >= MIN_YEAR; y--) years.push(y)

  const days = []
  for (let d = 1; d <= maxDay; d++) days.push(d)

  function handleYearChange(e) {
    setYear(Number(e.target.value))
  }

  function handleMonthChange(e) {
    setMonth(Number(e.target.value))
  }

  function handleDayChange(e) {
    setDay(Number(e.target.value))
  }

  function handleConfirm() {
    onSelect(new Date(year, month, safeDay))
  }

  return (
    <div className="p-4">
      <p className="font-serif text-base text-rose-dark text-center mb-4">
        Jump to a date
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div>
          <label className="block text-[10px] uppercase tracking-wide text-rose-dark/60 mb-1 text-center">
            Month
          </label>
          <select
            value={month}
            onChange={handleMonthChange}
            className="w-full text-sm px-2 py-2 rounded-lg border-2 border-rose-dark/30 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-gold"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wide text-rose-dark/60 mb-1 text-center">
            Day
          </label>
          <select
            value={safeDay}
            onChange={handleDayChange}
            className="w-full text-sm px-2 py-2 rounded-lg border-2 border-rose-dark/30 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-gold"
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wide text-rose-dark/60 mb-1 text-center">
            Year
          </label>
          <select
            value={year}
            onChange={handleYearChange}
            className="w-full text-sm px-2 py-2 rounded-lg border-2 border-rose-dark/30 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-gold"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-ink/10">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-rose font-semibold hover:underline"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="bg-gold text-ink text-xs font-semibold px-4 py-2 rounded-full"
        >
          Jump to this date
        </button>
      </div>
    </div>
  )
}