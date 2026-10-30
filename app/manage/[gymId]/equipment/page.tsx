'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Item = {
  id: number
  name: string
  category: string | null
  status: string
}

const STATUSES = ['working', 'broken', 'maintenance']
const CATEGORIES = ['cardio', 'strength', 'free weights', 'other']

export default function ManageEquipment() {
  const { gymId } = useParams<{ gymId: string }>()
  const router = useRouter()
  const [gymName, setGymName] = useState<string | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [error, setError] = useState<string | null>(null)

  // add form
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('strength')
  const [adding, setAdding] = useState(false)

  // inline edit
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState('')

  const loadItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('equipment')
      .select('id, name, category, status')
      .eq('gym_id', gymId)
      .order('name')
    if (error) return setError(error.message)
    setItems(data ?? [])
  }, [gymId])

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return router.replace('/login')

      const { data: gym } = await supabase
        .from('gyms')
        .select('name, owner_id')
        .eq('id', gymId)
        .single()
      if (!gym || gym.owner_id !== user.id) return router.replace('/manage')

      setGymName(gym.name)
      loadItems()
    }
    load()
  }, [gymId, router, loadItems])

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError(null)
    const { error } = await supabase.from('equipment').insert({
      gym_id: Number(gymId),
      name: newName.trim(),
      category: newCategory,
    })
    setAdding(false)
    if (error) return setError(error.message)
    setNewName('')
    loadItems()
  }

  async function updateStatus(id: number, status: string) {
    setError(null)
    const { error } = await supabase
      .from('equipment')
      .update({ status })
      .eq('id', id)
    if (error) return setError(error.message)
    setItems((list) => list.map((i) => (i.id === id ? { ...i, status } : i)))
  }

  function startEdit(item: Item) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditCategory(item.category ?? 'other')
  }

  async function saveEdit(id: number) {
    setError(null)
    const { error } = await supabase
      .from('equipment')
      .update({ name: editName.trim(), category: editCategory })
      .eq('id', id)
    if (error) return setError(error.message)
    setEditingId(null)
    loadItems()
  }

  async function removeItem(item: Item) {
    const ok = window.confirm(
      `Remove "${item.name}"? Any reports about it will be deleted too.`
    )
    if (!ok) return
    setError(null)
    const { error } = await supabase.from('equipment').delete().eq('id', item.id)
    if (error) return setError(error.message)
    setItems((list) => list.filter((i) => i.id !== item.id))
  }

  if (!gymName) return <p className="p-6">Loading...</p>

  const field =
    'rounded-lg border bg-transparent p-2 text-sm [&>option]:text-black'

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <Link
        href={`/manage/${gymId}`}
        className="text-sm text-gray-500 underline"
      >
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{gymName}: Equipment</h1>

      <form onSubmit={addItem} className="mt-6 flex flex-wrap gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
          placeholder="New equipment name"
          className={`${field} min-w-0 flex-1`}
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className={field}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={adding}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {adding ? 'Adding...' : 'Add'}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border p-4">
            {editingId === item.id ? (
              <div className="flex flex-wrap gap-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`${field} min-w-0 flex-1`}
                />
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className={field}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => saveEdit(item.id)}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-2 text-sm text-gray-500 underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value)}
                    className={field}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => startEdit(item)}
                    className="text-sm text-gray-500 underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeItem(item)}
                    className="text-sm text-red-500 underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <p className="text-gray-500">
            No equipment yet. Add the first piece above.
          </p>
        )}
      </ul>
    </main>
  )
}