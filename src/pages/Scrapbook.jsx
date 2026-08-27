import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import MemoryCard from '../components/MemoryCard.jsx'
import MemoryModal from '../components/MemoryModal.jsx'

export default function Scrapbook() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMemory, setEditingMemory] = useState(null)

  useEffect(() => {
    loadMemories()
  }, [])

  async function loadMemories() {
    setLoading(true)
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('date', { ascending: false })

    if (error) console.error('Error loading memories:', error.message)
    setMemories(data || [])
    setLoading(false)
  }

  function handleAddClick() {
    setEditingMemory(null)
    setShowModal(true)
  }

  function handleEditClick(memory) {
    setEditingMemory(memory)
    setShowModal(true)
  }

  async function handleRemove(id) {
    const { error } = await supabase.from('memories').delete().eq('id', id)
    if (error) {
      console.error('Error removing memory:', error.message)
      return
    }
    setMemories((prev) => prev.filter((m) => m.id !== id))
  }

  function handleSaved() {
    setShowModal(false)
    setEditingMemory(null)
    loadMemories()
  }

  return (
    <div className="max-w-3xl mx-auto px-5 pt-10 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl">Scrapbook</h1>
        <button
          onClick={handleAddClick}
          className="bg-gold hover:bg-gold-dark text-ink font-semibold text-sm px-4 py-2 rounded-full transition-colors"
        >
          + Add
        </button>
      </div>

      {loading && (
        <p className="text-center text-sm text-paper/50">loading...</p>
      )}

      {!loading && memories.length === 0 && (
        <p className="text-center text-sm text-paper/50">
          No entries yet — tap "+ Add" to create your first one.
        </p>
      )}

      {!loading && memories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {memories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onEdit={() => handleEditClick(memory)}
              onRemove={() => handleRemove(memory.id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <MemoryModal
          memory={editingMemory}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}