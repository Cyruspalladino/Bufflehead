'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Gym = { id: number; name: string; address: string | null }

export default function ManagerHome() {
  const router = useRouter()
  const [name, setName] = useState<string | null>(null)
  const [gyms, setGyms] = useState<Gym[]>([])

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
      if (profile?.role !== 'manager') return router.replace('/home')

      const { data } = await supabase
        .from('gyms')
        .select('id, name, address')
        .eq('owner_id', user.id)

      setName(profile?.display_name ?? user.email ?? 'there')
      setGyms(data ?? [])
    }
    load()
  }, [router])

  if (!name) return <p className="p-6">Loading...</p>

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Welcome, {name}</h1>
      <h2 className="mt-8 text-lg font-semibold">Your gyms</h2>

      {gyms.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">No gym linked to your account yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Ask the Bufflehead admin to connect your account to your gym.
          </p>
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {gyms.map((gym) => (
            <li key={gym.id}>
              <Link
                href={`/manage/${gym.id}`}
                className="block rounded-lg border p-4 hover:bg-gray-50 hover:text-black"
              >
                <p className="font-semibold">{gym.name}</p>
                {gym.address && (
                  <p className="text-sm text-gray-500">{gym.address}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}