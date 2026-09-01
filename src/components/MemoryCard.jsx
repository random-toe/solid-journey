import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function MemoryModal({ memory, onClose, onSaved }) {
  const [title, setTitle] = useState(memory?.title || '')
  const [date, setDate] = useState(memory?.date || '')
  const [kind, setKind] = useState(memory?.kind || 'just because')
  const [note, setNote] = useState(memory?.note || '')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(memory?.photo_url || null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title || !date) return
    setSaving(true)
    setError('')

    let photo_url = memory?.photo_url || null

    // Upload new photo if one was picked
    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('memory-photos')
        .upload(fileName, photoFile)

      if (uploadError) {
        setSaving(false)
        setError('Photo upload failed: ' + uploadError.message)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('memory-photos')
        .getPublicUrl(fileName)

      photo_url = publicUrlData.publicUrl
    }

    const payload = { title, date, kind, note, photo_url }

    const { error: saveError } = memory
      ? await supabase.from('memories').update(payload).eq('id', memory.id)
      : await supabase.from('memories').insert(payload)

    setSaving(false)

    if (saveError) {
      setError('Saving failed: ' + saveError.message)
      return
    }

    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-ink/80 flex items-end sm:items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-paper text-ink rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="font-serif text-xl">
          {memory ? 'Edit memory' : 'Add a memory'}
        </h2>

        <div>
          <label className="text-xs font-semibold text-ink/60">Photo</label>
          <label className="mt-1 flex items-center justify-center border-2 border-dashed border-ink/20 rounded-lg h-40 cursor-pointer overflow-hidden bg-paper-light">
            {photoPreview ? (
              <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm text-ink/40">Tap to choose a photo</span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink/60">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Beach trip"
            className="w-full mt-1 px-3 py-2 rounded-lg border border-ink/10 bg-paper-light focus:outline-none focus:ring-2 focus:ring-gold"
            required
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-ink/60">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-ink/10 bg-paper-light focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-ink/60">Category</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-ink/10 bg-paper-light focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="just because">Just because</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink/60">Description</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="A short note about this memory..."
            className="w-full mt-1 px-3 py-2 rounded-lg border border-ink/10 bg-paper-light focus:outline-none focus:ring-2 focus:ring-gold resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

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