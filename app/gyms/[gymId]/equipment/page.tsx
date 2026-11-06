import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { unitLabels } from '@/lib/unitLabels'

const statusStyles: Record<string, string> = {
  working: 'bg-green-100 text-green-800',
  broken: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
}

type Item = { id: number; name: string; category: string | null; status: string }

function StatusRow({ item, gymId }: { item: Item; gymId: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`rounded-full px-3 py-1 text-sm font-medium ${
          statusStyles[item.status] ?? 'bg-gray-100 text-gray-800'
        }`}
      >
        {item.status}
      </span>
      <Link
        href={`/gyms/${gymId}/report?equipment=${item.id}`}
        className="text-sm text-gray-500 underline"
      >
        Report
      </Link>
    </div>
  )
}

export default async function EquipmentPage({
  params,
}: {
  params: Promise<{ gymId: string }>
}) {
  const { gymId } = await params

  const { data, error } = await supabase
    .from('equipment')
    .select('id, name, category, status')
    .eq('gym_id', gymId)
    .order('name')
    .order('id')

  if (error) {
    return <p className="p-6">Error loading equipment: {error.message}</p>
  }

  const items: Item[] = data ?? []
  const labels = unitLabels(items)

  const groups = new Map<string, Item[]>()
  for (const item of items) {
    groups.set(item.name, [...(groups.get(item.name) ?? []), item])
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <Link href={`/gyms/${gymId}`} className="text-sm text-gray-500 underline">
        ← Back to gym
      </Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Equipment</h1>
      <ul className="space-y-3">
        {[...groups.values()].map((units) => {
          const first = units[0]
          const multi = units.length > 1
          const working = units.filter((u) => u.status === 'working').length
          return (
            <li key={first.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {first.name}
                    {multi && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ×{units.length}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{first.category}</p>
                </div>
                {multi ? (
                  <span className="text-sm text-gray-500">
                    {working} of {units.length} working
                  </span>
                ) : (
                  <StatusRow item={first} gymId={gymId} />
                )}
              </div>

              {multi && (
                <ul className="mt-3 space-y-2 border-t pt-3">
                  {units.map((u) => (
                    <li
                      key={u.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{labels.get(u.id)}</span>
                      <StatusRow item={u} gymId={gymId} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
        {items.length === 0 && (
          <p className="text-gray-500">No equipment listed for this gym yet.</p>
        )}
      </ul>
    </div>
  )
}