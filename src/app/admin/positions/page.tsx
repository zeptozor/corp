'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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

export default function AdminPositionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [positions, setPositions] = useState([])
  const [regulations, setRegulations] = useState<Regulation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm<PositionForm>()

  useEffect(() => {
    if (status === 'authenticated' && !['owner', 'ceo'].includes(session?.user?.role)) {
      router.push('/')
    }
    fetchPositions()
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

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions')
      if (response.ok) {
        const data = await response.json()
        setPositions(data)
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error)
    }
  }

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

  const onSubmit = async (data: PositionForm) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create position')
      }

      toast.success('Должность создана')
      reset()
      fetchPositions()
    } catch (error) {
      toast.error('Ошибка при создании должности')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (positionId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту должность?')) return

    try {
      const response = await fetch(`/api/positions/${positionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete position')

      toast.success('Должность удалена')
      fetchPositions()
    } catch (error) {
      toast.error('Ошибка при удалении должности')
    }
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500' />
      </div>
    )
  }

  if (status !== 'authenticated' || ['ceo', 'owner'].includes(session.user.role)) return null

  return (
    <div className='max-w-4xl mx-auto py-8 px-4'>
      <h1 className='text-2xl font-semibold text-gray-900 mb-8'>Управление должностями</h1>

      <div className='bg-white shadow-sm rounded-lg p-6 mb-8'>
        <h2 className='text-xl font-medium text-gray-900 mb-6'>Создать новую должность</h2>
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

          <button
            type='submit'
            disabled={isLoading}
            className={`w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Создание...' : 'Создать должность'}
          </button>
        </form>
      </div>

      <div className='space-y-4'>
        <h2 className='text-xl font-medium text-gray-900'>Существующие должности</h2>
        {positions.map((position: any) => (
          <div key={position.id} className='bg-white shadow-sm rounded-lg p-6'>
            <div className='flex justify-between items-start mb-4'>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>{position.title}</h3>
                <p className='text-sm text-gray-500'>{position.description}</p>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => router.push(`/admin/positions/${position.id}/edit`)}
                  className='px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200'
                >
                  Изменить
                </button>
                <button
                  onClick={() => handleDelete(position.id)}
                  className='px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200'
                >
                  Удалить
                </button>
              </div>
            </div>
            <div className='mt-4'>
              <h4 className='text-sm font-medium text-gray-700 mb-2'>Связанные регламенты:</h4>
              <div className='flex flex-wrap gap-2'>
                {position.regulations.map((regulation: any) => (
                  <span key={regulation.id} className='px-2 py-1 text-xs bg-gray-100 rounded-full'>
                    {regulation.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
