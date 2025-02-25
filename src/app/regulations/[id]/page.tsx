'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Regulation } from '@/types'
import Header from '@/components/ui/header'

export default function RegulationPage() {
  const params = useParams()
  const [regulation, setRegulation] = useState<Regulation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRegulation = async () => {
      try {
        if (!params?.id) throw new Error('ID регламента отсутствует')

        const response = await fetch(`/api/regulations/${params.id}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to fetch regulation')
        setRegulation(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load regulation')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRegulation()
  }, [params?.id])

  if (isLoading)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='border-y-3 border-x rounded-full border-blue-600 animate-spin size-[40px]' />
      </div>
    )

  if (error || !regulation) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-red-500'>{error || 'Регламент не найден'}</div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className='max-w-3xl mx-auto py-8 px-4'>
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h1 className='text-2xl font-semibold'>{regulation.title}</h1>
            <span className='text-sm text-gray-500'>{regulation.group.name}</span>
          </div>
          <div className='flex flex-wrap gap-[10px] mb-6'>
            {regulation.keywords.map((keyword) => (
              <span key={keyword} className='px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full'>
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <div className='max-w-none'>{regulation.content}</div>
      </div>
    </>
  )
}
