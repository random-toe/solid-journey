import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { formatDate } from '../utils'

const KIND_LABELS = {
  'just because': 'Just because',
  milestone: 'Milestone',
}

export default function MemoryViewPanel({ memory, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const kindLabel = KIND_LABELS[memory.kind] || memory.kind || 'Just because'

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <div
        className="relative bg-paper text-ink rounded-sm shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-ink/70 text-paper text-lg leading-none flex items-center justify-center"
        >
          ×
        </button>

        {memory.photo_url ? (
          <img
            src={memory.photo_url}
            alt={memory.title}
            className="w-full max-h-[50vh] object-cover rounded-sm"
          />
        ) : (
          <div className="w-full aspect-video rounded-sm bg-ink/5 flex items-center justify-center text-ink/30 text-sm">
            no photo
          </div>
        )}

        <div className="mt-4">
          <p className="text-[10px] tracking-widest uppercase text-rose font-semibold">
            {kindLabel}
          </p>
          <h2 className="font-serif font-bold text-2xl leading-snug mt-1">
            {memory.title}
          </h2>
          <p className="font-serif italic text-sm text-gold-dark mt-1">
            {formatDate(memory.date)}
          </p>
          {memory.note ? (
            <p className="text-sm text-ink/80 mt-3 whitespace-pre-wrap">
              {memory.note}
            </p>
          ) : (
            <p className="text-sm text-ink/40 italic mt-3">No details added.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}