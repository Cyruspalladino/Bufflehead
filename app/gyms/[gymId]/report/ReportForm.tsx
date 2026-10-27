'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Item = { id: number; name: string }

export default function ReportForm({
  gymId,
  equipment,
  preselected,
}: {
  gymId: string
  equipment: Item[]
  preselected?: string
}) {
  const [equipmentId, setEquipmentId] = useState(preselected ?? '')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You need to log in to report an issue.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('issues').insert({
      equipment_id: Number(equipmentId),
      description: description.trim(),
      reported_by: user.id,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="font-semibold">Thanks, your report was sent.</p>
        <p className="mt-1 text-sm text-gray-500">
          The gym manager will take a look.
        </p>
        <Link
          href={`/gyms/${gymId}/equipment`}
          className="mt-4 inline-block rounded-lg border px-4 py-2 text-sm"
        >
          Back to equipment
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        value={equipmentId}
        onChange={(e) => setEquipmentId(e.target.value)}
        required
        className="w-full rounded-lg border bg-transparent p-3"
      >
        <option value="" disabled>
          Which equipment?
        </option>
        {equipment.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        rows={4}
        placeholder="What's wrong? (e.g. cable snapped, seat won't adjust)"
        className="w-full rounded-lg border bg-transparent p-3"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-white p-3 font-medium text-black disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Submit report'}
      </button>
    </form>
  )
}