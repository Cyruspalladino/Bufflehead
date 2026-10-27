import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ReportForm from './ReportForm'

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ gymId: string }>
  searchParams: Promise<{ equipment?: string }>
}) {
  const { gymId } = await params
  const { equipment: preselected } = await searchParams

  const { data: equipment } = await supabase
    .from('equipment')
    .select('id, name')
    .eq('gym_id', gymId)
    .order('name')

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <Link href={`/gyms/${gymId}`} className="text-sm text-gray-500 underline">
        ← Back to gym
      </Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Report an issue</h1>
      <ReportForm
        gymId={gymId}
        equipment={equipment ?? []}
        preselected={preselected}
      />
    </main>
  )
}