'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { User } from '@/types'
import Header from '@/components/ui/header'

export default function UserProfile() {
  const params = useParams()
  const userId = params.id as string
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) throw new Error('Failed to fetch user')
        setUser(await response.json())
      } catch {
        setError('Не удалось загрузить данные сотрудника')
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) fetchUser()
  }, [userId])

  if (isLoading)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='border-y-3 border-x rounded-full border-blue-600 animate-spin size-[40px]' />
      </div>
    )

  if (error || !user)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-red-500'>{error || 'Сотрудник не найден'}</div>
      </div>
    )

  return (
    <>
      <Header />
      <div className='max-w-3xl mx-auto py-8 px-4 flex flex-col gap-[20px]'>
        <div className='flex items-center space-x-4'>
          <div className='size-[60px] rounded-full flex items-center justify-center'>
            <img src={`/${user.photo}`} className='size-full rounded-full' />
          </div>
          <div className='w-full flex items-center justify-between'>
            <h1 className={`text-2xl font-semibold ${user.isOwner ? 'text-blue-600' : ''}`}>{user.name}</h1>
            <a
              target='_blank'
              href={`tg://resolve?domain=${user.telegram}`}
              className='rounded-full bg-blue-500/70 px-[5px] py-[2px]'
            >
              @{user.telegram}
            </a>
          </div>
        </div>
        <div className='border-t border-gray-200 pt-4'>
          <dl className='grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2'>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Дата трудоустроиства</dt>
              <dd className='mt-1 text-sm'>{new Date(user.employmentDate).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
        <div className='border-t border-gray-200 pt-4'>
          <dl className='grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2'>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Дата рождения</dt>
              <dd className='mt-1 text-sm'>{new Date(user.birthDate).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
        <div className='border-t border-gray-200 pt-4'>
          <dl className='grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2'>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Почты</dt>
              <dd className='mt-1 text-sm'>{user.email1}</dd>
              <dd className='mt-1 text-sm'>{user.email2}</dd>
            </div>
          </dl>
        </div>
        <div className='border-t border-gray-200 pt-6'>
          <h2 className='text-lg font-medium text-gray-900 mb-4'>Должности</h2>
          <div className='flex flex-wrap gap-[10px]'>
            {user.positions.map((position) => (
              <Link
                href={`/positions/${position.id}`}
                key={position.id}
                className='rounded-full bg-yellow-400/70 px-[5px] py-[2px]'
              >
                {position.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
