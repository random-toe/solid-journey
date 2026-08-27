import { useEffect, useRef, useState } from 'react'
import { getTimeTogether, getNextAnniversary } from '../utils'

export default function Time({ settings }) {
  const [together, setTogether] = useState(null)
  const [hearts, setHearts] = useState([])
  const heartIdRef = useRef(0)
  const containerRef = useRef(null)

  const nextAnniversary = settings?.since
    ? getNextAnniversary(settings.since)
    : null

  useEffect(() => {
    if (!settings?.since) return

    setTogether(getTimeTogether(settings.since))
    const interval = setInterval(() => {
      setTogether(getTimeTogether(settings.since))
    }, 1000)

    return () => clearInterval(interval)
  }, [settings?.since])

  function handleTapTap(e) {
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const id = heartIdRef.current++
    const emoji = ['💛', '💫', '✨'][Math.floor(Math.random() * 3)]
    const drift = (Math.random() - 0.5) * 60

    setHearts((prev) => [...prev, { id, x, y, emoji, drift }])

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id))
    }, 1400)
  }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 pb-16">
      <h1 className="font-serif text-2xl mb-6 text-center">Time</h1>

      <div className="bg-ink-light rounded-2xl p-8 text-center">
        <p className="text-xs tracking-widest uppercase text-paper/50">
          together for
        </p>
        <p className="font-serif text-5xl mt-2">
          {together ? together.days : '—'}{' '}
          <span className="text-2xl">days</span>
        </p>

        {together && (
          <p className="mt-1 text-sm text-paper/50">
            {together.hours}h {together.minutes}m {together.seconds}s
          </p>
        )}

        {nextAnniversary && (
          <div className="mt-6 flex justify-center gap-10">
            <div>
              <p className="font-serif text-2xl text-gold">
                {nextAnniversary.daysUntil}
              </p>
              <p className="text-xs text-paper/50">days to go</p>
            </div>
            <div>
              <p className="font-serif text-2xl text-gold">
                {nextAnniversary.ordinal}
              </p>
              <p className="text-xs text-paper/50">anniversary</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Tap-tap hearts ─────────────────────── */}
      <div
        ref={containerRef}
        onClick={handleTapTap}
        className="relative mt-6 bg-ink-light rounded-2xl h-56 flex items-center justify-center overflow-hidden cursor-pointer select-none"
      >
        {hearts.map((heart) => (
          <span
            key={heart.id}
            className="floating-heart text-2xl"
            style={{
              left: heart.x,
              top: heart.y,
              '--drift': `${heart.drift}px`,
            }}
          >
            {heart.emoji}
          </span>
        ))}

        <button
          onClick={(e) => {
            e.stopPropagation()
            handleTapTap(e)
          }}
          className="bg-rose text-ink font-semibold text-sm px-6 py-3 rounded-full pointer-events-auto"
        >
          💗 tap tap
        </button>
      </div>
    </div>
  )
}