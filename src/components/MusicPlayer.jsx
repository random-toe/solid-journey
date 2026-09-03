import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'

// ── URL helpers ────────────────────────────────────────────

function getYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  )
  return match ? match[1] : null
}

function getSpotifyInfo(url) {
  const match = url.match(/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/)
  return match ? { type: match[1], id: match[2] } : null
}

function detectProvider(url) {
  if (!url) return null
  if (/youtube\.com|youtu\.be/.test(url)) return 'YouTube'
  if (/open\.spotify\.com/.test(url)) return 'Spotify'
  return null
}

export default function MusicPlayer() {
  const [songs, setSongs] = useState([])
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const youtubeIframeRef = useRef(null)
  const spotifyContainerRef = useRef(null)
  const spotifyApiRef = useRef(null) // window's IFrameAPI, once script loads
  const spotifyControllerRef = useRef(null) // active EmbedController

  const current = songs[index] || null
  const provider = current ? detectProvider(current.url) : null
  const youtubeId = provider === 'YouTube' ? getYouTubeId(current.url) : null
  const spotifyInfo = provider === 'Spotify' ? getSpotifyInfo(current.url) : null

  // ── Load songs from Supabase ───────────────────────────
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

  // ── Reset "playing" state whenever the current song changes ──
  useEffect(() => {
    setIsPlaying(true)
  }, [index, songs.length])

  // ── Load the Spotify IFrame API script once ────────────
  useEffect(() => {
    if (window.Spotify_IFrameAPIReadyAttached) return
    window.Spotify_IFrameAPIReadyAttached = true

    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      spotifyApiRef.current = IFrameAPI
    }

    const script = document.createElement('script')
    script.src = 'https://open.spotify.com/embed/iframe-api/v1'
    script.async = true
    document.body.appendChild(script)
  }, [])

  // ── (Re)create the Spotify controller whenever the current Spotify track changes ──
  useEffect(() => {
    if (provider !== 'Spotify' || !spotifyInfo) return

    function createController() {
      if (!spotifyApiRef.current || !spotifyContainerRef.current) return
      spotifyContainerRef.current.innerHTML = '' // clear previous embed
      spotifyApiRef.current.createController(
        spotifyContainerRef.current,
        { uri: `spotify:${spotifyInfo.type}:${spotifyInfo.id}` },
        (controller) => {
          spotifyControllerRef.current = controller
          controller.addListener('ready', () => {
            controller.play()
          })
        }
      )
    }

    if (spotifyApiRef.current) {
      createController()
    } else {
      // API script hasn't loaded yet — poll briefly until it's ready
      const interval = setInterval(() => {
        if (spotifyApiRef.current) {
          clearInterval(interval)
          createController()
        }
      }, 200)
      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, provider])

  function handleNext() {
    if (songs.length === 0) return
    setIndex((i) => (i + 1) % songs.length)
  }

  function handlePrev() {
    if (songs.length === 0) return
    setIndex((i) => (i - 1 + songs.length) % songs.length)
  }

  function handlePlayPause() {
    if (!current) return

    if (provider === 'YouTube') {
      const win = youtubeIframeRef.current?.contentWindow
      if (!win) return
      win.postMessage(
        JSON.stringify({
          event: 'command',
          func: isPlaying ? 'pauseVideo' : 'playVideo',
          args: [],
        }),
        '*'
      )
      setIsPlaying((p) => !p)
    } else if (provider === 'Spotify') {
      if (spotifyControllerRef.current) {
        spotifyControllerRef.current.togglePlay()
        setIsPlaying((p) => !p)
      }
    }
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

  const youtubeEmbedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&playsinline=1`
    : null

  return (
    <div className="fixed bottom-[64px] inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-sm bg-ink-light/95 backdrop-blur border border-gold/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* ── Collapsed bar — always visible, has play/pause ── */}
        <div className="flex items-center gap-1 px-3 py-2">
          <button
            onClick={handlePrev}
            disabled={songs.length === 0}
            className="w-8 h-8 flex items-center justify-center rounded-full text-paper/70 hover:text-gold disabled:opacity-30 transition-colors"
            aria-label="Previous song"
          >
            ⏮
          </button>

          <button
            onClick={handlePlayPause}
            disabled={!current}
            className="w-8 h-8 flex items-center justify-center rounded-full text-paper/70 hover:text-gold disabled:opacity-30 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex-1 min-w-0 text-left px-1"
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

        {/*
          ── Media embeds ──────────────────────────────────
          Always mounted (never removed from the DOM) so playback
          keeps going even while collapsed — just visually hidden
          via max-height/opacity instead of unmounting.
        */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-3 pb-3">
            {provider === 'YouTube' && youtubeEmbedUrl && (
              <div className="rounded-lg overflow-hidden aspect-video bg-black">
                <iframe
                  ref={youtubeIframeRef}
                  key={current.id}
                  src={youtubeEmbedUrl}
                  title={current.title}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            )}

            {provider === 'Spotify' && (
              <div ref={spotifyContainerRef} className="rounded-lg overflow-hidden" />
            )}

            {!provider && (
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
        </div>
      </div>
    </div>
  )
}