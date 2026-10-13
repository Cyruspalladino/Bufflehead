import { supabase } from '@/lib/supabase'

const statusStyles: Record<string, string> = {
  working: 'bg-green-100 text-green-800',
  broken: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
}

export default async function EquipmentPage() {
  const { data, error } = await supabase.from('equipment').select('*')

  if (error) {
    return <p>Error loading equipment: {error.message}</p>
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Equipment</h1>
      <ul className="space-y-3">
        {data?.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between border rounded-lg p-4"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500">{item.category}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusStyles[item.status] ?? 'bg-gray-100 text-gray-800'
              }`}
            >
              {item.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}