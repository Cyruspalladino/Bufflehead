'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { unitLabels } from '@/lib/unitLabels'
import FloorPlan from '@/app/components/FloorPlanLoader'
import type { FloorItem } from '@/app/components/FloorPlan'

export default function ManageLayout() {
  const { gymId } = useParams<{ gymId: string }>()
  const router = useRouter()
  const [gymName, setGymName] = useState<string | null>(null)
  const [items, setItems] = useState<FloorItem[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('equipment')
      .select('id, name, status, x_position, y_position')
      .eq('gym_id', gymId)
      .order('name')
    if (error) return setError(error.message)

    const mapped = (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      x: r.x_position === null ? null : Number(r.x_position),
      y: r.y_position === null ? null : Number(r.y_position),
    }))
    const labels = unitLabels(mapped)
    setItems(mapped.map((i) => ({ ...i, name: labels.get(i.id) ?? i.name })))
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

  async function savePosition(id: number, x: number | null, y: number | null) {
    setError(null)
    setItems((list) => list.map((i) => (i.id === id ? { ...i, x, y } : i)))
    const { error } = await supabase
      .from('equipment')
      .update({ x_position: x, y_position: y })
      .eq('id', id)
    if (error) setError(error.message)
  }

  // First open slot on the grid (canvas is 800x500, items are 100x60)
  function freeSpot() {
    for (let y = 20; y <= 440; y += 80) {
      for (let x = 20; x <= 700; x += 120) {
        const taken = items.some(
          (i) =>
            i.x !== null &&
            i.y !== null &&
            Math.abs(i.x - x) < 100 &&
            Math.abs(i.y - y) < 60
        )
        if (!taken) return { x, y }
      }
    }
    return { x: 20, y: 20 }
  }

  if (!gymName) return <p className="p-6">Loading...</p>

  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <Link href={`/manage/${gymId}`} className="text-sm text-gray-500 underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{gymName}: Floor plan</h1>
      <p className="mb-4 mt-1 text-sm text-gray-500">
        Drag equipment to position it. Items snap to the grid and save
        automatically.
      </p>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <FloorPlan
        items={items}
        editable
        selectedId={selectedId}
        onSelect={setSelectedId}
        onMove={savePosition}
      />

      <h2 className="mt-8 text-lg font-semibold">Equipment</h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">
                {item.x === null ? 'Not on the floor plan' : 'On the floor plan'}
              </p>
            </div>
            {item.x === null ? (
              <button
                onClick={() => {
                  const spot = freeSpot()
                  savePosition(item.id, spot.x, spot.y)
                  setSelectedId(item.id)
                }}
                className="rounded-lg border px-3 py-1.5 text-sm"
              >
                Place on floor
              </button>
            ) : (
              <button
                onClick={() => savePosition(item.id, null, null)}
                className="text-sm text-gray-500 underline"
              >
                Remove from floor
              </button>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <p className="text-gray-500">
            No equipment yet. Add some under Manage equipment first.
          </p>
        )}
      </ul>
    </main>
  )
}