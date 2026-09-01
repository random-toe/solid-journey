import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { formatDate } from '../utils'
import DatePicker from '../components/DatePicker.jsx'

export default function Letters() {
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLetter, setEditingLetter] = useState(null)

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
    <div className="max-w-2xl mx-auto px-5 pt-16 sm:pt-20 pb-16">
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

        {!loading && letters.length === 0 && (
          <p className="text-center text-sm text-paper/50 py-8">
            No letters yet — write your first one.
          </p>
        )}

        {!loading &&
          letters.map((letter) => (
            <div key={letter.id} className="p-4 flex items-start gap-3">
              <span className="text-gold mt-0.5">✉️</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{letter.title}</p>
                <p className="text-xs text-paper/50">{formatDate(letter.date)}</p>
              </div>
              <div className="flex gap-3 text-xs">
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
            </div>
          ))}
      </div>

      {showForm && (
        <LetterForm
          letter={editingLetter}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

function LetterForm({ letter, onClose, onSaved }) {
  const [title, setTitle] = useState(letter?.title || '')
  const [date, setDate] = useState(letter?.date || '')
  const [content, setContent] = useState(letter?.content || '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title || !date) return
    setSaving(true)

    const payload = { title, date, content }
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