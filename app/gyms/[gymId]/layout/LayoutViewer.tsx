'use client'

import { useState } from 'react'
import Link from 'next/link'
import FloorPlan from '@/app/components/FloorPlanLoader'
import type { FloorItem } from '@/app/components/FloorPlan'

const statusStyles: Record<string, string> = {
  working: 'bg-green-100 text-green-800',
  broken: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
}

export default function LayoutViewer({
  gymId,
  items,
}: {
  gymId: string
  items: FloorItem[]
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = items.find((i) => i.id === selectedId)
  const placed = items.filter((i) => i.x !== null)
  const unplaced = items.filter((i) => i.x === null)

  if (placed.length === 0) {
    return (
      <p className="text-gray-500">
        This gym's floor plan hasn't been set up yet.
      </p>
    )
  }

  return (
    <>
      <FloorPlan items={items} selectedId={selectedId} onSelect={setSelectedId} />

      <div className="mt-4 rounded-lg border p-4">
        {selected ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{selected.name}</p>
              <span
                className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  statusStyles[selected.status] ?? 'bg-gray-100 text-gray-800'
                }`}
              >
                {selected.status}
              </span>
            </div>
            <Link
              href={`/gyms/${gymId}/report?equipment=${selected.id}`}
              className="text-sm text-gray-500 underline"
            >
              Report an issue
            </Link>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Tap a piece of equipment on the map to see its details.
          </p>
        )}
      </div>

      {unplaced.length > 0 && (
        <p className="mt-4 text-sm text-gray-500">
          Not on the map yet: {unplaced.map((i) => i.name).join(', ')}
        </p>
      )}
    </>
  )
}