'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Position {
  id: string
  title: string
  users: {
    id: string
    name: string
    role: string
    photo: string
  }[]
  regulations: {
    id: string
    title: string
    group: {
      name: string
    }
  }[]
}

export default function PositionPage() {
  const params = useParams()
  const [position, setPosition] = useState<Position | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        if (!params?.id) {
          throw new Error('Position ID is missing')
        }

        const response = await fetch(`/api/positions/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch position')
        const data = await response.json()
        setPosition(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load position')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosition()
  }, [params?.id])

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500' />
      </div>
    )
  }

  if (error || !position) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-red-500'>{error || 'Position not found'}</div>
      </div>
    )
  }

  return (
    <div className='max-w-3xl mx-auto py-8 px-4'>
      <div className='bg-white shadow-sm rounded-lg p-6'>
        <h1 className='text-2xl font-semibold text-gray-900 mb-6'>{position.title}</h1>

        <div className='space-y-8'>
          {/* Regulations Section */}
          <div>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>Связанные регламенты</h2>
            <div className='grid gap-4'>
              {position.regulations.map((regulation) => (
                <Link
                  key={regulation.id}
                  href={`/regulations/${regulation.id}`}
                  className='block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 transition-colors'
                >
                  <div className='flex justify-between items-center'>
                    <h3 className='text-sm font-medium text-indigo-600'>{regulation.title}</h3>
                    <span className='text-xs text-gray-500'>{regulation.group.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Users Section */}
          <div>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>Сотрудники на этой должности</h2>
            <div className='grid gap-4'>
              {position.users.map((user) => (
                <Link
                  key={user.id}
                  href={`/users/${user.id}`}
                  className='block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 transition-colors'
                >
                  <div className='flex items-center space-x-3'>
                    <div className='flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center'>
                      <img src={`/${user.photo}`} className='size-full rounded-full' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>{user.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
