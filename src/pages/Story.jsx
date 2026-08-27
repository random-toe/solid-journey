import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Story({ settings }) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(settings?.story_content || '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('settings')
      .update({ story_content: content })
      .eq('id', settings.id)

    setSaving(false)
    if (error) {
      console.error('Error saving story:', error.message)
      return
    }
    setEditing(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl">How we met</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-gold text-sm font-semibold hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      <div className="bg-ink-light rounded-2xl p-6">
        {!editing && (
          <p className="whitespace-pre-wrap leading-relaxed text-paper/90">
            {content || 'Your story starts here — tap "Edit" to write it.'}
          </p>
        )}

        {editing && (
          <div className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              placeholder="It started at a coffee shop neither of us usually went to..."
              className="w-full px-3 py-3 rounded-lg bg-ink text-paper border border-paper/10 focus:outline-none focus:ring-2 focus:ring-gold resize-none leading-relaxed"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setContent(settings?.story_content || '')
                  setEditing(false)
                }}
                className="flex-1 py-3 rounded-full border border-paper/20 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-full bg-gold text-ink font-semibold text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}