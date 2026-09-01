import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Onboarding({
  mode,
  settings,
  onWizardComplete,
  onIdentityPicked,
}) {
  if (mode === 'gate') {
    return <IdentityGate settings={settings} onIdentityPicked={onIdentityPicked} />
  }
  return <Wizard onWizardComplete={onWizardComplete} />
}

// ── 3-step first-time setup wizard ─────────────────────────
// Step 1: "Sino ka?"          → your own name
// Step 2: "Sino partner mo?"  → partner's name
// Step 3: "Kailan monthsary?" → relationship start date
function Wizard({ onWizardComplete }) {
  const [step, setStep] = useState(1)
  const [yourName, setYourName] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [since, setSince] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleFinish(e) {
    e.preventDefault()
    if (!since) return
    setSaving(true)
    setError('')

    const { data, error: insertError } = await supabase
      .from('settings')
      .insert({
        partner_one_name: yourName,
        partner_two_name: partnerName,
        since,
      })
      .select()
      .single()

    setSaving(false)

    if (insertError) {
      setError('Something went wrong: ' + insertError.message)
      return
    }

    onWizardComplete(data)
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="bg-ink-light rounded-3xl w-full max-w-sm p-8 text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-rose font-semibold mb-3">
          a little archive of us
        </p>

        {step === 1 && (
          <Step
            title="what's your name?"
            value={yourName}
            onChange={setYourName}
            placeholder="Your name"
            onNext={() => yourName && setStep(2)}
            buttonLabel="Continue"
          />
        )}

        {step === 2 && (
          <Step
            title="what's your partner's name?"
            value={partnerName}
            onChange={setPartnerName}
            placeholder="Partner's name"
            onNext={() => partnerName && setStep(3)}
            onBack={() => setStep(1)}
            buttonLabel="Continue"
          />
        )}

        {step === 3 && (
          <form onSubmit={handleFinish}>
            <h1 className="font-serif text-2xl mb-1">kailan monthsary?</h1>
            <p className="text-xs text-paper/50 mb-5">the date it all started</p>

            <input
              type="date"
              value={since}
              onChange={(e) => setSince(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-paper text-ink text-center focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />

            {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="mt-5 w-full bg-gold hover:bg-gold-dark text-ink font-semibold py-3 rounded-full transition-colors disabled:opacity-50"
            >
              {saving ? 'Starting...' : 'Start the archive'}
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-3 text-xs text-paper/40 hover:text-paper/70"
            >
              ← back
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function Step({ title, value, onChange, placeholder, onNext, onBack, buttonLabel }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onNext()
      }}
    >
      <h1 className="font-serif text-2xl mb-5">{title}</h1>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-full bg-paper text-ink text-center focus:outline-none focus:ring-2 focus:ring-gold"
        autoFocus
        required
      />

      <button
        type="submit"
        className="mt-5 w-full bg-gold hover:bg-gold-dark text-ink font-semibold py-3 rounded-full transition-colors"
      >
        {buttonLabel}
      </button>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-3 text-xs text-paper/40 hover:text-paper/70"
        >
          ← back
        </button>
      )}
    </form>
  )
}

// ── Returning-visitor identity gate ────────────────────────
// Shown once per device — picks between the two names already
// saved in `settings`, then remembers the choice via localStorage
// (handled by the parent, via onIdentityPicked).
function IdentityGate({ settings, onIdentityPicked }) {
  const names = [settings?.partner_one_name, settings?.partner_two_name].filter(
    Boolean
  )

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="bg-ink-light rounded-3xl w-full max-w-sm p-8 text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-rose font-semibold mb-3">
          a little archive of us
        </p>
        <h1 className="font-serif text-2xl mb-6">who are you?</h1>

        <div className="space-y-3">
          {names.map((name) => (
            <button
              key={name}
              onClick={() => onIdentityPicked(name)}
              className="w-full bg-paper text-ink font-semibold py-3 rounded-full hover:bg-gold transition-colors"
            >
              {name}
            </button>
          ))}
        </div>

        <p className="mt-5 text-xs text-paper/40">
          we'll remember you on this device
        </p>
      </div>
    </div>
  )
}