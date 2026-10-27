import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const sections = [
  { slug: 'equipment', label: 'Equipment', desc: "What's here and what's working" },
  { slug: 'layout', label: 'Floor plan', desc: 'See where everything is' },
  { slug: 'routines', label: 'Routines', desc: 'Plan a workout for this gym' },
  { slug: 'report', label: 'Report an issue', desc: 'Flag broken or missing equipment' },
]

export default async function GymHub({
  params,
}: {
  params: Promise<{ gymId: string }>
}) {
  const { gymId } = await params

  const { data: gym } = await supabase
    .from('gyms')
    .select('name, address')
    .eq('id', gymId)
    .single()

  if (!gym) notFound()

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/home" className="text-sm text-gray-500 underline">
        ← My gyms
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{gym.name}</h1>
      {gym.address && <p className="text-gray-500">{gym.address}</p>}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.slug}
            href={`/gyms/${gymId}/${s.slug}`}
            className="rounded-lg border p-4 hover:bg-gray-50 hover:text-black"
          >
            <p className="font-semibold">{s.label}</p>
            <p className="text-sm text-gray-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}