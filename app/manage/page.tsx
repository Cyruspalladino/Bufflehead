'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ManagerHome() {
  const router = useRouter()
  const [name, setName] = useState<string | null>(null)

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
      setName(profile?.display_name ?? user.email ?? 'there')
    }
    load()
  }, [router])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!name) return <p className="p-6">Loading...</p>

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Welcome, {name}</h1>
      <p className="mt-2 text-gray-500">Manager dashboard goes here.</p>
      <button onClick={logout} className="mt-6 rounded-lg border px-4 py-2">
        Log out
      </button>
    </main>
  )
}