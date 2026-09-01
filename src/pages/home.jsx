import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { formatDate, getTimeTogether, getNextAnniversary } from '../utils'
import MemoryCard from '../components/MemoryCard.jsx'
import MemoryModal from '../components/MemoryModal.jsx'

export default function Home({ settings, identity }) {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMemory, setEditingMemory] = useState(null)

  useEffect(() => {
    loadMemories()
  }, [])

  async function loadMemories() {
    setLoading(true)
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('date', { ascending: false })

    if (error) console.error('Error loading memories:', error.message)
    setMemories(data || [])
    setLoading(false)
  }

  function handleAddClick() {
    setEditingMemory(null)
    setShowModal(true)
  }

  function handleEditClick(memory) {
    setEditingMemory(memory)
    setShowModal(true)
  }

  async function handleRemove(id) {
    const { error } = await supabase.from('memories').delete().eq('id', id)
    if (error) {
      console.error('Error removing memory:', error.message)
      return
    }
    setMemories((prev) => prev.filter((m) => m.id !== id))
  }

  function handleSaved(savedMemory) {
    setShowModal(false)
    setEditingMemory(null)
    loadMemories()
  }

  const together = settings?.since ? getTimeTogether(settings.since) : null
  const nextAnniversary = settings?.since
    ? getNextAnniversary(settings.since)
    : null

  const partnerOne = settings?.partner_one_name || 'Partner One'
  const partnerTwo = settings?.partner_two_name || 'Partner Two'

  return (
    <div className="max-w-2xl mx-auto px-5 pt-16 sm:pt-20 pb-16">
      {/* ── Hero ─────────────────────────────── */}
      <div className="text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-rose font-semibold mb-3">
          a little archive of us
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl">
          {partnerOne} <span className="text-gold italic">&amp;</span>{' '}
          {partnerTwo}
        </h1>

        {identity && (
          <p className="mt-2 text-sm text-paper/60">
            welcome back, {identity}!
          </p>
        )}

        {settings?.since && together && (
          <p className="mt-3 text-sm text-paper/70">
            Since{' '}
            <span className="font-semibold text-paper">
              {formatDate(settings.since)}
            </span>{' '}
            — <span className="font-semibold text-gold">{together.days}</span>{' '}
            days and counting
          </p>
        )}

        <button
          onClick={handleAddClick}
          className="mt-6 bg-gold hover:bg-gold-dark text-ink font-semibold px-6 py-3 rounded-full transition-colors"
        >
          + Add a memory
        </button>

        {nextAnniversary && (
          <div className="mt-8 inline-flex items-center gap-4 bg-ink-light rounded-2xl px-6 py-4">
            <span className="font-serif text-3xl text-gold">
              {nextAnniversary.daysUntil}
            </span>
            <span className="text-left text-sm text-paper/70">
              days until your
              <br />
              <span className="font-semibold text-paper">
                {nextAnniversary.ordinal} anniversary
              </span>
            </span>
          </div>
        )}
      </div>

      {/* ── Timeline ─────────────────────────── */}
      <div className="mt-14 relative">
        {loading && (
          <p className="text-center text-sm text-paper/50">loading memories...</p>
        )}

        {!loading && memories.length === 0 && (
          <p className="text-center text-sm text-paper/50">
            No memories yet — add your first one above.
          </p>
        )}

        {!loading && memories.length > 0 && (
          <div className="relative pl-6 border-l-2 border-dotted border-gold/40 space-y-8">
            {memories.map((memory) => (
              <div key={memory.id} className="relative">
                <span className="absolute -left-[29px] top-2 w-3 h-3 rounded-full bg-gold" />
                <MemoryCard
                  memory={memory}
                  onEdit={() => handleEditClick(memory)}
                  onRemove={() => handleRemove(memory.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-16 text-center text-xs text-paper/40">
        Shared with anyone who has this link — keep it just between the two of you.
      </p>

      {showModal && (
        <MemoryModal
          memory={editingMemory}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}