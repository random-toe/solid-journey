import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

// ── URL helpers ────────────────────────────────────────────
// Turns a normal YouTube/Spotify link into its embeddable iframe URL.

function getEmbedUrl(url) {
  if (!url) return null

  // YouTube — supports youtube.com/watch?v=, youtu.be/, youtube.com/shorts/
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  )
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`
  }

  // Spotify — track/album/playlist links
  const spotifyMatch = url.match(
    /open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/
  )
  if (spotifyMatch) {
    return `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`
  }

  return null
}

function detectProvider(url) {
  if (/youtube\.com|youtu\.be/.test(url)) return 'YouTube'
  if (/open\.spotify\.com/.test(url)) return 'Spotify'
  return null
}

export default function MusicPlayer() {
  const [songs, setSongs] = useState([])
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSongs()
  }, [])

  async function loadSongs() {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('position', { ascending: true })

    if (error) {
      console.error('Error loading songs:', error.message)
      return
    }
    setSongs(data || [])
  }

  function handleNext() {
    if (songs.length === 0) return
    setIndex((i) => (i + 1) % songs.length)
  }

  function handlePrev() {
    if (songs.length === 0) return
    setIndex((i) => (i - 1 + songs.length) % songs.length)
  }

  async function handleAddSong(e) {
    e.preventDefault()
    if (!newTitle || !newUrl) return

    if (!detectProvider(newUrl)) {
      setError('Only YouTube or Spotify links are supported.')
      return
    }

    setSaving(true)
    setError('')

    const { error: insertError } = await supabase.from('songs').insert({
      title: newTitle,
      url: newUrl,
      position: songs.length,
    })

    setSaving(false)

    if (insertError) {
      setError('Could not add that song: ' + insertError.message)
      return
    }

    setNewTitle('')
    setNewUrl('')
    setShowAddForm(false)
    loadSongs()
  }

  const current = songs[index] || null
  const embedUrl = current ? getEmbedUrl(current.url) : null

  return (
    <div className="fixed bottom-[64px] inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-sm bg-ink-light/95 backdrop-blur border border-gold/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* ── Collapsed bar ─────────────────────── */}
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={handlePrev}
            disabled={songs.length === 0}
            className="w-8 h-8 flex items-center justify-center rounded-full text-paper/70 hover:text-gold disabled:opacity-30 transition-colors"
            aria-label="Previous song"
          >
            ⏮
          </button>

          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex-1 min-w-0 text-left"
          >
            <p className="text-xs text-paper/50 leading-none">
              {songs.length === 0 ? 'no songs added yet' : '🎵 now playing'}
            </p>
            <p className="text-sm font-semibold truncate leading-tight mt-0.5">
              {current ? current.title : 'Add your first song'}
            </p>
          </button>

          <button
            onClick={handleNext}
            disabled={songs.length === 0}
            className="w-8 h-8 flex items-center justify-center rounded-full text-paper/70 hover:text-gold disabled:opacity-30 transition-colors"
            aria-label="Next song"
          >
            ⏭
          </button>

          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-paper/50 hover:text-paper transition-colors"
            aria-label={expanded ? 'Collapse player' : 'Expand player'}
          >
            {expanded ? '︿' : '﹀'}
          </button>
        </div>

        {/* ── Expanded panel ───────────────────────── */}
        {expanded && (
          <div className="border-t border-paper/10 p-3">
            {embedUrl ? (
              <div className="rounded-lg overflow-hidden aspect-video bg-black">
                <iframe
                  key={current.id}
                  src={embedUrl}
                  title={current.title}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="text-xs text-paper/40 text-center py-4">
                {songs.length === 0
                  ? 'No songs in the playlist yet.'
                  : "Couldn't load this song's embed."}
              </p>
            )}

            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-3 w-full text-xs text-gold font-semibold py-2 rounded-full border border-gold/30 hover:bg-gold/10 transition-colors"
              >
                + add a song
              </button>
            ) : (
              <form onSubmit={handleAddSong} className="mt-3 space-y-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Song title"
                  className="w-full px-3 py-2 rounded-lg bg-ink text-paper text-sm border border-paper/10 focus:outline-none focus:ring-2 focus:ring-gold"
                  required
                />
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="YouTube or Spotify link"
                  className="w-full px-3 py-2 rounded-lg bg-ink text-paper text-sm border border-paper/10 focus:outline-none focus:ring-2 focus:ring-gold"
                  required
                />
                {error && <p className="text-xs text-rose">{error}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setError('')
                    }}
                    className="flex-1 py-2 rounded-full border border-paper/20 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2 rounded-full bg-gold text-ink text-xs font-semibold disabled:opacity-50"
                  >
                    {saving ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}