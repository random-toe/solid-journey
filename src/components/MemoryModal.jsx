import { formatDate } from '../utils'

const KIND_LABELS = {
  'just because': 'Just because',
  milestone: 'Milestone',
}

export default function MemoryCard({ memory, onEdit, onRemove }) {
  const kindLabel = KIND_LABELS[memory.kind] || memory.kind || 'Just because'

  return (
    <div className="relative bg-paper text-ink rounded-sm shadow-lg pt-3 px-3 pb-4 rotate-[-0.5deg] hover:rotate-0 transition-transform">
      {/* tape accent */}
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
        <p className="font-serif font-bold text-lg leading-snug mt-0.5">
          {memory.title}
        </p>
        <p className="font-serif italic text-sm text-gold-dark mt-0.5">
          {formatDate(memory.date)}
        </p>
        {memory.note && (
          <p className="text-sm text-ink/70 mt-2 whitespace-pre-wrap">
            {memory.note}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-3 pt-2 border-t border-ink/10 text-xs">
        <button onClick={onEdit} className="text-gold-dark font-semibold hover:underline">
          Edit
        </button>
        <button onClick={onRemove} className="text-rose font-semibold hover:underline">
          Remove
        </button>
      </div>
    </div>
  )
}