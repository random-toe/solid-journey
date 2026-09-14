import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { formatDate } from '../utils'
import DatePicker from '../components/DatePicker.jsx'

export default function Letters({ settings, identity }) {
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLetter, setEditingLetter] = useState(null)
  const [viewingLetter, setViewingLetter] = useState(null)

  const partnerNames = [settings?.partner_one_name, settings?.partner_two_name].filter(
    Boolean
  )

  // Visible if: the current identity wrote it, OR it's addressed to them.
  // Letters saved before this feature existed have no recipient/author yet —
  // those stay visible to everyone rather than disappearing.
  const visibleLetters = letters.filter(
    (l) =>
      (!l.recipient && !l.author) ||
      l.author === identity ||
      l.recipient === identity
  )

  useEffect(() => {
    loadLetters()
  }, [])

  async function loadLetters() {
    setLoading(true)
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .order('date', { ascending: false })

    if (error) console.error('Error loading letters:', error.message)
    setLetters(data || [])
    setLoading(false)
  }

  function handleAddClick() {
    setEditingLetter(null)
    setShowForm(true)
  }

  function handleViewClick(letter) {
    setViewingLetter(letter)
  }

  function handleEditFromView() {
    setEditingLetter(viewingLetter)
    setViewingLetter(null)
    setShowForm(true)
  }

  function handleEditClick(letter) {
    setEditingLetter(letter)
    setShowForm(true)
  }

  async function handleRemove(id) {
    const { error } = await supabase.from('letters').delete().eq('id', id)
    if (error) {
      console.error('Error removing letter:', error.message)
      return
    }
    setLetters((prev) => prev.filter((l) => l.id !== id))
  }

  function handleSaved() {
    setShowForm(false)
    setEditingLetter(null)
    loadLetters()
  }

  return (
    <div className="max-w-3xl mx-auto px-5 pt-10 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl">Letters</h1>
        <button
          onClick={handleAddClick}
          className="bg-gold hover:bg-gold-dark text-ink font-semibold text-sm px-4 py-2 rounded-full transition-colors"
        >
          + Add
        </button>
      </div>

      <div className="bg-ink-light rounded-2xl divide-y divide-paper/10 overflow-hidden">
        {loading && (
          <p className="text-center text-sm text-paper/50 py-8">loading...</p>
        )}

        {!loading && visibleLetters.length === 0 && (
          <p className="text-center text-sm text-paper/50 py-8">
            No letters yet — write your first one.
          </p>
        )}

        {!loading &&
          visibleLetters.map((letter) => {
            const isAuthor = !letter.author || letter.author === identity
            return (
              <div key={letter.id} className="p-4 flex items-start gap-3">
                <span className="text-gold mt-0.5">✉️</span>
                <button
                  onClick={() => handleViewClick(letter)}
                  className="flex-1 text-left"
                >
                  <p className="font-semibold text-sm hover:text-gold transition-colors">
                    {letter.title}
                  </p>
                  <p className="text-xs text-paper/50">{formatDate(letter.date)}</p>
                </button>
                {isAuthor ? (
                  <div className="flex gap-3 text-xs shrink-0 pt-0.5">
                    <button
                      onClick={() => handleEditClick(letter)}
                      className="text-gold hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemove(letter.id)}
                      className="text-rose hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-paper/30 shrink-0 pt-0.5">view only</span>
                )}
              </div>
            )
          })}
      </div>

      {viewingLetter && (
        <LetterViewPanel
          letter={viewingLetter}
          identity={identity}
          onClose={() => setViewingLetter(null)}
          onEdit={handleEditFromView}
        />
      )}

      {showForm && (
        <LetterForm
          letter={editingLetter}
          partnerNames={partnerNames}
          identity={identity}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

// ── Read-only view panel — opened by tapping a letter's title ──
function LetterViewPanel({ letter, identity, onClose, onEdit }) {
  const isAuthor = !letter.author || letter.author === identity

  return (
    <div
      className="fixed inset-0 bg-ink/80 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-paper text-ink rounded-2xl w-full max-w-lg p-8 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="font-serif text-3xl leading-snug">{letter.title}</h2>
          <button
            onClick={onClose}
            className="shrink-0 text-ink/40 hover:text-ink text-2xl leading-none mt-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="font-serif italic text-base text-gold-dark mb-1">
          {formatDate(letter.date)}
        </p>

        {letter.recipient && (
          <p className="text-xs text-ink/40 mb-6">for {letter.recipient}</p>
        )}
        {!letter.recipient && <div className="mb-6" />}

        <p className="whitespace-pre-wrap leading-relaxed text-ink/80 text-[15px]">
          {letter.content || (
            <span className="text-ink/40 italic">This letter has no content yet.</span>
          )}
        </p>

        <div className="flex gap-3 pt-8 mt-4 border-t border-ink/10">
          <button
            onClick={onClose}
            className={`py-3.5 rounded-full border border-ink/20 font-semibold text-sm ${
              isAuthor ? 'flex-1' : 'w-full'
            }`}
          >
            Close
          </button>
          {isAuthor && (
            <button
              onClick={onEdit}
              className="flex-1 py-3.5 rounded-full bg-gold font-semibold text-sm"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function LetterForm({ letter, partnerNames, identity, onClose, onSaved }) {
  const [title, setTitle] = useState(letter?.title || '')
  const [date, setDate] = useState(letter?.date || '')
  const [content, setContent] = useState(letter?.content || '')
  const defaultRecipient = partnerNames.find((n) => n !== identity) || partnerNames[0] || ''
  const [recipient, setRecipient] = useState(letter?.recipient || defaultRecipient)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title || !date) return
    setSaving(true)

    const payload = { title, date, content, recipient: recipient || null }
    // author is set once, when the letter is first created — never
    // overwritten on later edits.
    if (!letter) payload.author = identity || null

    const { error } = letter
      ? await supabase.from('letters').update(payload).eq('id', letter.id)
      : await supabase.from('letters').insert(payload)

    setSaving(false)
    if (error) {
      console.error('Error saving letter:', error.message)
      return
    }
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-ink/80 flex items-end sm:items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-paper text-ink rounded-2xl w-full max-w-md p-6 space-y-4"
      >
        <h2 className="font-serif text-xl">
          {letter ? 'Edit letter' : 'New letter'}
        </h2>

        <div>
          <label className="text-xs font-semibold text-ink/60">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="To you, on a Tuesday"
            className="w-full mt-1 px-3 py-2 rounded-lg border border-ink/10 bg-paper-light focus:outline-none focus:ring-2 focus:ring-gold"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-ink/60">Date</label>
          <div className="mt-1">
            <DatePicker value={date} onChange={setDate} />
          </div>
        </div>

        {partnerNames.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-ink/60">
              Para kanino ang letter na ito?
            </label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-ink/10 bg-paper-light focus:outline-none focus:ring-2 focus:ring-gold"
            >
              {partnerNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-ink/60">Letter</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Write your letter..."
            className="w-full mt-1 px-3 py-2 rounded-lg border border-ink/10 bg-paper-light focus:outline-none focus:ring-2 focus:ring-gold resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-ink/20 font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-full bg-gold font-semibold text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}