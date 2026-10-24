'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Nav() {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [role, setRole] = useState<'member' | 'manager' | null>(null)

  useEffect(() => {
    async function refresh(userId: string | undefined) {
      if (!userId) {
        setLoggedIn(false)
        setRole(null)
        setLoaded(true)
        return
      }
      setLoggedIn(true)
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      setRole(data?.role === 'manager' ? 'manager' : 'member')
      setLoaded(true)
    }

    supabase.auth.getUser().then(({ data }) => refresh(data.user?.id))

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // setTimeout avoids a known deadlock from calling Supabase inside this callback
      setTimeout(() => refresh(session?.user.id), 0)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const homeHref = !loggedIn ? '/' : role === 'manager' ? '/manage' : '/home'

  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      <Link href={homeHref} className="text-lg font-bold">
        Bufflehead
      </Link>

      {loaded && (
        <div className="flex items-center gap-5 text-sm">
          {loggedIn && role === 'member' && (
            <Link href="/home" className="hover:underline">
              My gyms
            </Link>
          )}
          {loggedIn && role === 'manager' && (
            <Link href="/manage" className="hover:underline">
              Dashboard
            </Link>
          )}

          {loggedIn ? (
            <button onClick={logout} className="rounded-lg border px-3 py-1.5">
              Log out
            </button>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border px-3 py-1.5"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}