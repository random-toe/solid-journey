import { useState } from 'react'
import { formatDate } from '../utils'
import MemoryViewPanel from './MemoryViewpanel'

const KIND_LABELS = {
  'just because': 'Just because',
  milestone: 'Milestone',
}

export default function MemoryCard({ memory, onEdit, onRemove }) {
  const [viewing, setViewing] = useState(false)
  const kindLabel = KIND_LABELS[memory.kind] || memory.kind || 'Just because'

  return (
    <div className="relative bg-paper text-ink rounded-sm shadow-lg pt-3 px-3 pb-4 rotate-[-0.5deg] hover:rotate-0 transition-transform">
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 bg-gold/60 rotate-[-2deg] rounded-sm" />

      {memory.photo_url ? (
        <img
          src={memory.photo_url}
          alt={memory.title}
          className="w-full aspect-square object-cover rounded-sm"
        />
      ) : (
        <div className="w-full aspect-square rounded-sm bg-ink/5 flex items-center justify-center text-ink/30 text-sm">
          no photo
        </div>
      )}

      <div className="mt-3">
        <p className="text-[10px] tracking-widest uppercase text-rose font-semibold">
          {kindLabel}
        </p>
        <button
          type="button"
          onClick={() => setViewing(true)}
          className="font-serif font-bold text-lg leading-snug mt-0.5 text-left hover:text-gold-dark underline decoration-dotted decoration-ink/30 underline-offset-4"
        >
          {memory.title}
        </button>
        <p className="font-serif italic text-sm text-gold-dark mt-0.5">
          {formatDate(memory.date)}
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-3 pt-2 border-t border-ink/10 text-xs">
        <button onClick={onEdit} className="text-gold-dark font-semibold hover:underline">
          Edit
        </button>
        <button onClick={onRemove} className="text-rose font-semibold hover:underline">
          Remove
        </button>
      </div>

      {viewing && (
        <MemoryViewPanel memory={memory} onClose={() => setViewing(false)} />
      )}
    </div>
  )
}