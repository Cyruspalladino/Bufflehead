'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Issue = {
  id: number
  description: string
  status: 'open' | 'in_progress' | 'resolved'
  created_at: string
  equipment: { id: number; name: string; status: string }
}

export default function ManageGym() {
  const { gymId } = useParams<{ gymId: string }>()
  const router = useRouter()
  const [gymName, setGymName] = useState<string | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [showResolved, setShowResolved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadIssues = useCallback(async () => {
    const { data, error } = await supabase
      .from('issues')
      .select(
        'id, description, status, created_at, equipment!inner(id, name, status, gym_id)'
      )
      .eq('equipment.gym_id', gymId)
      .order('created_at', { ascending: false })
    if (error) return setError(error.message)
    setIssues((data ?? []) as unknown as Issue[])
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
      loadIssues()
    }
    load()
  }, [gymId, router, loadIssues])

  async function setIssueStatus(id: number, status: Issue['status']) {
    setError(null)
    const { error } = await supabase
      .from('issues')
      .update({
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      })
      .eq('id', id)
    if (error) return setError(error.message)
    loadIssues()
  }

  async function setEquipmentStatus(equipmentId: number, status: string) {
    setError(null)
    const { error } = await supabase
      .from('equipment')
      .update({ status })
      .eq('id', equipmentId)
    if (error) return setError(error.message)
    loadIssues()
  }

  if (!gymName) return <p className="p-6">Loading...</p>

  const visible = issues.filter((i) => showResolved || i.status !== 'resolved')

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <Link href="/manage" className="text-sm text-gray-500 underline">
        ← Your gyms
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{gymName}</h1>
      <Link href={`/manage/${gymId}/equipment`} className="mt-3 inline-block rounded-lg border px-4 py-2 text-sm">
        Manage equipment
      </Link>
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Reports</h2>
        <label className="flex items-center gap-2 text-sm text-gray-500">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
          />
          Show resolved
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <ul className="mt-3 space-y-3">
        {visible.map((issue) => (
          <li key={issue.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{issue.equipment.name}</p>
                <p className="mt-1 text-sm">{issue.description}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(issue.created_at).toLocaleString()}
                </p>
              </div>
              <span className="whitespace-nowrap rounded-full border px-3 py-1 text-xs">
                {issue.status.replace('_', ' ')}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {issue.status !== 'in_progress' && issue.status !== 'resolved' && (
                <button
                  onClick={() => setIssueStatus(issue.id, 'in_progress')}
                  className="rounded-lg border px-3 py-1.5"
                >
                  Mark in progress
                </button>
              )}
              {issue.status !== 'resolved' ? (
                <button
                  onClick={() => setIssueStatus(issue.id, 'resolved')}
                  className="rounded-lg border px-3 py-1.5"
                >
                  Mark resolved
                </button>
              ) : (
                <button
                  onClick={() => setIssueStatus(issue.id, 'open')}
                  className="rounded-lg border px-3 py-1.5"
                >
                  Reopen
                </button>
              )}
              {issue.equipment.status !== 'broken' ? (
                <button
                  onClick={() => setEquipmentStatus(issue.equipment.id, 'broken')}
                  className="rounded-lg border px-3 py-1.5"
                >
                  Mark equipment broken
                </button>
              ) : (
                <button
                  onClick={() => setEquipmentStatus(issue.equipment.id, 'working')}
                  className="rounded-lg border px-3 py-1.5"
                >
                  Mark equipment working
                </button>
              )}
            </div>
          </li>
        ))}
        {visible.length === 0 && (
          <p className="text-gray-500">No open reports. Nice.</p>
        )}
      </ul>
    </main>
  )
}