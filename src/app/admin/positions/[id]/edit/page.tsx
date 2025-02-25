'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface PositionForm {
  title: string
  description: string
  regulations: string[]
}

interface Regulation {
  id: string
  title: string
  group: {
    name: string
  }
}

export default function EditPositionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [regulations, setRegulations] = useState<Regulation[]>([])
  const { register, handleSubmit, reset, setValue } = useForm<PositionForm>()

  useEffect(() => {
    if (status === 'authenticated' && !['owner', 'ceo'].includes(session?.user?.role)) {
      router.push('/')
    }
    fetchPosition()
    fetchRegulations()
  }, [session, router, status])

  if (status === 'loading') {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500' />
      </div>
    )
  }

  if (status !== 'authenticated' || !['owner', 'ceo'].includes(session?.user?.role)) return null

  const fetchRegulations = async () => {
    try {
      const response = await fetch('/api/regulations')
      if (response.ok) {
        const data = await response.json()
        setRegulations(data)
      }
    } catch (error) {
      console.error('Failed to fetch regulations:', error)
    }
  }

  const fetchPosition = async () => {
    try {
      const response = await fetch(`/api/positions/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch position')
      const position = await response.json()

      setValue('title', position.title)
      setValue('description', position.description)
      setValue(
        'regulations',
        position.regulations.map((r: any) => r.id)
      )
    } catch (error) {
      toast.error('Failed to load position')
      router.push('/admin/positions')
    }
  }

  const onSubmit = async (data: PositionForm) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/positions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update position')

      toast.success('Должность обновлена')
      router.push('/admin/positions')
    } catch (error) {
      toast.error('Ошибка при обновлении должности')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500' />
      </div>
    )
  }

  if (status !== 'authenticated' || ['admin', 'ceo'].includes(session.user.role)) return null

  return (
    <div className='max-w-4xl mx-auto py-8 px-4'>
      <h1 className='text-2xl font-semibold text-gray-900 mb-8'>Редактировать должность</h1>

      <div className='bg-white shadow-sm rounded-lg p-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Название</label>
            <input
              type='text'
              {...register('title', { required: true })}
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Описание</label>
            <textarea
              {...register('description', { required: true })}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Регламенты</label>
            <select
              multiple
              {...register('regulations')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            >
              {regulations.map((regulation) => (
                <option key={regulation.id} value={regulation.id}>
                  {regulation.title} ({regulation.group.name})
                </option>
              ))}
            </select>
            <p className='text-sm text-gray-500 mt-1'>Используйте Ctrl (Cmd) для выбора нескольких регламентов</p>
          </div>

          <div className='flex gap-4'>
            <button
              type='submit'
              disabled={isLoading}
              className={`flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
            <button
              type='button'
              onClick={() => router.push('/admin/positions')}
              className='flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200'
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
