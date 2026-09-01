const TABS = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'scrapbook', label: 'Scrapbook', icon: '📷' },
  { key: 'letters', label: 'Letters', icon: '✉️' },
  { key: 'story', label: 'Story', icon: '📖' },
  { key: 'time', label: 'Time', icon: '⏳' },
]

export default function Navigation({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-ink-dark border-t border-paper/10 pb-[env(safe-area-inset-bottom)] z-40">
      <div className="max-w-2xl mx-auto grid grid-cols-5">
        {TABS.map((tab) => {
          const isActive = active === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs transition-colors ${
                isActive ? 'text-gold' : 'text-paper/50'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className={isActive ? 'font-semibold' : ''}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}