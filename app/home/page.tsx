'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Gym = { id: number; name: string; address: string | null }

export default function MemberHome() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [allGyms, setAllGyms] = useState<Gym[]>([])
  const [savedIds, setSavedIds] = useState<number[]>([])
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return router.replace('/login')

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', user.id)
        .single()
      if (profile?.role === 'manager') return router.replace('/manage')

      const [{ data: gyms }, { data: saved }] = await Promise.all([
        supabase.from('gyms').select('id, name, address').order('name'),
        supabase.from('member_gyms').select('gym_id').eq('user_id', user.id),
      ])

      setUserId(user.id)
      setName(profile?.display_name ?? user.email ?? 'there')
      setAllGyms(gyms ?? [])
      setSavedIds((saved ?? []).map((r) => r.gym_id))
    }
    load()
  }, [router])

  const myGyms = allGyms.filter((g) => savedIds.includes(g.id))
  const available = allGyms.filter((g) => !savedIds.includes(g.id))

  async function addGym(gymId: number) {
    if (!userId) return
    setError(null)
    const { error } = await supabase
      .from('member_gyms')
      .insert({ user_id: userId, gym_id: gymId })
    if (error) return setError(error.message)
    setSavedIds((ids) => [...ids, gymId])
    setAdding(false)
  }

  async function removeGym(gymId: number) {
    if (!userId) return
    setError(null)
    const { error } = await supabase
      .from('member_gyms')
      .delete()
      .eq('user_id', userId)
      .eq('gym_id', gymId)
    if (error) return setError(error.message)
    setSavedIds((ids) => ids.filter((id) => id !== gymId))
  }

  if (!name) return <p className="p-6">Loading...</p>

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Welcome, {name}</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">My gyms</h2>
        {myGyms.length > 0 && (
          <button
            onClick={() => setAdding((a) => !a)}
            className="rounded-lg border px-3 py-1.5 text-sm"
          >
            {adding ? 'Cancel' : '+ Add a gym'}
          </button>
        )}
      </div>

      {myGyms.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">No gyms yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Add your gym to see its equipment, floor plan, and routines.
          </p>
          {!adding && (
            <button
              onClick={() => setAdding(true)}
              className="mt-4 rounded-lg border px-4 py-2"
            >
              Add a gym
            </button>
          )}
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {myGyms.map((gym) => (
            <li
              key={gym.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <Link href={`/gyms/${gym.id}`} className="flex-1">
                <p className="font-semibold">{gym.name}</p>
                {gym.address && (
                  <p className="text-sm text-gray-500">{gym.address}</p>
                )}
              </Link>
              <button
                onClick={() => removeGym(gym.id)}
                className="ml-4 text-sm text-gray-500 underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <div className="mt-6">
          <h3 className="font-semibold">Available gyms</h3>
          {available.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              No more gyms to add right now.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {available.map((gym) => (
                <li
                  key={gym.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-semibold">{gym.name}</p>
                    {gym.address && (
                      <p className="text-sm text-gray-500">{gym.address}</p>
                    )}
                  </div>
                  <button
                    onClick={() => addGym(gym.id)}
                    className="rounded-lg border px-3 py-1.5 text-sm"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  )
}