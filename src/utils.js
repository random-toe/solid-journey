// ── Date formatting ──────────────────────────────────────

// e.g. "Oct 14, 2025"
export function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ── Together timer (days/hours/minutes/seconds since `since`) ──

export function getTimeTogether(sinceDateString) {
  if (!sinceDateString) return null
  const since = new Date(sinceDateString + 'T00:00:00')
  const now = new Date()
  const diffMs = now - since

  if (diffMs < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}

// ── Countdown to next anniversary ────────────────────────

export function getNextAnniversary(sinceDateString) {
  if (!sinceDateString) return null
  const since = new Date(sinceDateString + 'T00:00:00')
  const now = new Date()

  let nextAnniversary = new Date(
    now.getFullYear(),
    since.getMonth(),
    since.getDate()
  )

  // if this year's anniversary already passed, use next year's
  if (nextAnniversary < now) {
    nextAnniversary = new Date(
      now.getFullYear() + 1,
      since.getMonth(),
      since.getDate()
    )
  }

  const yearsAtNextAnniversary = nextAnniversary.getFullYear() - since.getFullYear()
  const diffMs = nextAnniversary - now
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  return {
    date: nextAnniversary,
    daysUntil,
    ordinal: getOrdinal(yearsAtNextAnniversary),
  }
}

function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// ── Identity gate (localStorage) ─────────────────────────
// Remembers which partner is using this device/browser, so the
// "who's opening this?" gate only needs to be answered once per device.

const IDENTITY_KEY = 'archive-of-us:identity'

export function getSavedIdentity() {
  try {
    return localStorage.getItem(IDENTITY_KEY)
  } catch {
    return null
  }
}

export function saveIdentity(name) {
  try {
    localStorage.setItem(IDENTITY_KEY, name)
  } catch {
    // localStorage unavailable (private browsing, etc.) — gate will just
    // reappear next visit, which is an acceptable fallback.
  }
}

export function clearIdentity() {
  try {
    localStorage.removeItem(IDENTITY_KEY)
  } catch {
    // no-op
  }
}