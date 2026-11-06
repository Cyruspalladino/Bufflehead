import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { unitLabels } from '@/lib/unitLabels'
import LayoutViewer from './LayoutViewer'

export default async function LayoutPage({
  params,
}: {
  params: Promise<{ gymId: string }>
}) {
  const { gymId } = await params

  const { data } = await supabase
    .from('equipment')
    .select('id, name, status, x_position, y_position')
    .eq('gym_id', gymId)
    .order('name')
    .order('id')

  const mapped = (data ?? []).map((r) => ({
    id: r.id as number,
    name: r.name as string,
    status: r.status as string,
    x: r.x_position === null ? null : Number(r.x_position),
    y: r.y_position === null ? null : Number(r.y_position),
  }))

  const labels = unitLabels(mapped)
  const items = mapped.map((i) => ({ ...i, name: labels.get(i.id) ?? i.name }))

  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <Link href={`/gyms/${gymId}`} className="text-sm text-gray-500 underline">
        ← Back to gym
      </Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Floor plan</h1>
      <LayoutViewer gymId={gymId} items={items} />
    </main>
  )
}