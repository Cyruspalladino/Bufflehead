import { supabase } from '@/lib/supabase'

export default async function EquipmentPage() {
  const { data, error } = await supabase.from('equipment').select('*')

  if (error) {
    return <p>Error loading equipment: {error.message}</p>
  }

  return (
    <div>
      <h1>Equipment</h1>
      <ul>
        {data?.map((item) => (
          <li key={item.id}>
            {item.name} — {item.category} — {item.status}
          </li>
        ))}
      </ul>
    </div>
  )
}