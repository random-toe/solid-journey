import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { getSavedIdentity, saveIdentity } from './utils'

import Onboarding from './components/Onboarding.jsx'
import Navigation from './components/Navigation.jsx'
import Home from './pages/home.jsx'
import Scrapbook from './pages/Scrapbook.jsx'
import Letters from './pages/Letters.jsx'
import Story from './pages/Story.jsx'
import Time from './pages/Time.jsx'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState(null) // null until we know
  const [identity, setIdentity] = useState(null)
  const [activeTab, setActiveTab] = useState('home')

  // ── 1. On mount: load settings, figure out identity ──────
  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error loading settings:', error.message)
    }

    setSettings(data || null)
    setIdentity(getSavedIdentity())
    setLoading(false)
  }

  function handleWizardComplete(newSettings) {
    setSettings(newSettings)
  }

  function handleIdentityPicked(name) {
    saveIdentity(name)
    setIdentity(name)
  }

  // ── 2. Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-paper">
        <p className="text-sm tracking-widest uppercase opacity-60">
          loading the archive...
        </p>
      </div>
    )
  }

  // ── 3. No settings yet → first-time 3-step onboarding wizard ──
  if (!settings) {
    return (
      <Onboarding mode="wizard" onWizardComplete={handleWizardComplete} />
    )
  }

  // ── 4. Settings exist, but this device hasn't picked "who are you" ──
  if (!identity) {
    return (
      <Onboarding
        mode="gate"
        settings={settings}
        onIdentityPicked={handleIdentityPicked}
      />
    )
  }

  // ── 5. Main app ────────────────────────────────────────────
  const pages = {
    home: <Home settings={settings} identity={identity} />,
    scrapbook: <Scrapbook />,
    letters: <Letters />,
    story: <Story settings={settings} />,
    time: <Time settings={settings} />,
  }

  return (
    <div className="min-h-screen text-paper pb-24">
      <main>{pages[activeTab]}</main>
      <Navigation active={activeTab} onChange={setActiveTab} />
    </div>
  )
}