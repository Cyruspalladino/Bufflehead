import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const statusStyles: Record<string, string> = {
  working: 'bg-green-100 text-green-800',
  broken: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
}

export default async function EquipmentPage({
  params,
}: {
  params: Promise<{ gymId: string }>
}) {
  const { gymId } = await params

  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('gym_id', gymId)
    .order('name')

  if (error) {
    return <p className="p-6">Error loading equipment: {error.message}</p>
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <Link href={`/gyms/${gymId}`} className="text-sm text-gray-500 underline">
        ← Back to gym
      </Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Equipment</h1>
      <ul className="space-y-3">
        {data?.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500">{item.category}</p>
            </div>
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
          </li>
        ))}
        {data?.length === 0 && (
          <p className="text-gray-500">No equipment listed for this gym yet.</p>
        )}
      </ul>
    </div>
  )
}