'use client'

import dynamic from 'next/dynamic'

const FloorPlan = dynamic(() => import('./FloorPlan'), {
  ssr: false,
  loading: () => <p className="text-gray-500">Loading floor plan...</p>,
})

export default FloorPlan