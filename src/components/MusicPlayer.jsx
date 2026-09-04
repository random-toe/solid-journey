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

  // YouTube — persistent player instance (created once, reused via loadVideoById)
  const ytContainerRef = useRef(null)
  const ytPlayerRef = useRef(null)
  const ytApiReadyRef = useRef(false)

  // Spotify — persistent controller instance (created once, reused via loadUri)
  const spotifyContainerRef = useRef(null)
  const spotifyApiRef = useRef(null)
  const spotifyControllerRef = useRef(null)

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

  // ══════════════════════════════════════════════════════
  // YouTube — load the IFrame Player API once, keep ONE
  // player instance alive for the whole session. Switching
  // songs calls loadVideoById() on that same instance instead
  // of destroying/recreating the iframe — this is what keeps
  // autoplay working reliably on mobile after Next/Prev.
  // ══════════════════════════════════════════════════════
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      ytApiReadyRef.current = true
      return
    }
    if (document.getElementById('youtube-iframe-api-script')) return

    const tag = document.createElement('script')
    tag.id = 'youtube-iframe-api-script'
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)

    window.onYouTubeIframeAPIReady = () => {
      ytApiReadyRef.current = true
      // if a YouTube song is already current, create the player now
      if (provider === 'YouTube' && youtubeId) {
        createYtPlayer(youtubeId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function createYtPlayer(videoId) {
    if (!ytContainerRef.current || ytPlayerRef.current) return
    ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
      videoId,
      playerVars: { autoplay: 1, playsinline: 1 },
      events: {
        onReady: (e) => {
          e.target.playVideo()
        },
        onStateChange: (e) => {
          setIsPlaying(e.data === window.YT.PlayerState.PLAYING)
        },
      },
    })
  }

  // Whenever the current song changes, tell the players to switch tracks
  // (rather than remounting anything).
  useEffect(() => {
    if (!current) return

    if (provider === 'YouTube' && youtubeId) {
      // pause Spotify if it was playing
      if (spotifyControllerRef.current) {
        try {
          spotifyControllerRef.current.pause()
        } catch {}
      }

      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        ytPlayerRef.current.loadVideoById(youtubeId)
      } else if (ytApiReadyRef.current) {
        createYtPlayer(youtubeId)
      }
      // if API isn't ready yet, onYouTubeIframeAPIReady will pick it up
    } else if (provider === 'Spotify' && spotifyInfo) {
      // pause YouTube if it was playing
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try {
          ytPlayerRef.current.pauseVideo()
        } catch {}
      }
      loadOrCreateSpotify(spotifyInfo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id])

  // ══════════════════════════════════════════════════════
  // Spotify — same idea: one persistent controller, reused
  // via loadUri() when switching tracks.
  // ══════════════════════════════════════════════════════
  useEffect(() => {
    if (window.Spotify_IFrameAPIReadyAttached) return
    window.Spotify_IFrameAPIReadyAttached = true

    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      spotifyApiRef.current = IFrameAPI
      if (provider === 'Spotify' && spotifyInfo) {
        loadOrCreateSpotify(spotifyInfo)
      }
    }

    const script = document.createElement('script')
    script.src = 'https://open.spotify.com/embed/iframe-api/v1'
    script.async = true
    document.body.appendChild(script)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function loadOrCreateSpotify(info) {
    const uri = `spotify:${info.type}:${info.id}`

    if (spotifyControllerRef.current) {
      spotifyControllerRef.current.loadUri(uri)
      spotifyControllerRef.current.play()
      return
    }

    if (!spotifyApiRef.current || !spotifyContainerRef.current) return // not ready yet

    spotifyApiRef.current.createController(
      spotifyContainerRef.current,
      { uri },
      (controller) => {
        spotifyControllerRef.current = controller
        controller.addListener('ready', () => controller.play())
        controller.addListener('playback_update', (e) => {
          setIsPlaying(!e.data.isPaused)
        })
      }
    )
  }

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

    if (provider === 'YouTube' && ytPlayerRef.current) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo()
      } else {
        ytPlayerRef.current.playVideo()
      }
    } else if (provider === 'Spotify' && spotifyControllerRef.current) {
      spotifyControllerRef.current.togglePlay()
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
          via max-height/opacity instead of unmounting. Same reason
          both YT + Spotify containers stay in the DOM permanently:
          destroying/recreating them is what broke autoplay-on-Next.
        */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expanded ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-3 pb-3 max-h-[80vh] overflow-y-auto">
            <div
              className="rounded-lg overflow-hidden bg-black"
              style={{ display: provider === 'YouTube' ? 'block' : 'none' }}
            >
              <div className="aspect-video">
                <div ref={ytContainerRef} className="w-full h-full" />
              </div>
            </div>

            <div
              ref={spotifyContainerRef}
              className="rounded-lg overflow-hidden"
              style={{ display: provider === 'Spotify' ? 'block' : 'none' }}
            />

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