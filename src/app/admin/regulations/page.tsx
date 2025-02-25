'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface RegulationForm {
  title: string
  content: string
  keywords: string
  groupId: string
}

interface RegulationGroup {
  id: string
  name: string
  description: string
}

export default function AdminRegulationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [regulations, setRegulations] = useState([])
  const [groups, setGroups] = useState<RegulationGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm<RegulationForm>()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/')
    }
    fetchRegulations()
    fetchGroups()
  }, [session, router, status])

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

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/regulations/groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data)
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    }
  }

  const onSubmit = async (data: RegulationForm) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/regulations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          keywords: data.keywords.split(',').map((k) => k.trim()),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create regulation')
      }

      toast.success('Регламент создан')
      reset()
      fetchRegulations()
    } catch (error) {
      toast.error('Ошибка при создании регламента')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (regulationId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот регламент?')) return

    try {
      const response = await fetch(`/api/regulations/${regulationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete regulation')

      toast.success('Регламент удален')
      fetchRegulations()
    } catch (error) {
      toast.error('Ошибка при удалении регламента')
    }
  }

  if (status === 'loading') {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500' />
      </div>
    )
  }

  if (status !== 'authenticated' || session?.user?.role !== 'admin') return null

  return (
    <div className='max-w-4xl mx-auto py-8 px-4'>
      <h1 className='text-2xl font-semibold text-gray-900 mb-8'>Управление регламентами</h1>

      <div className='bg-white shadow-sm rounded-lg p-6 mb-8'>
        <h2 className='text-xl font-medium text-gray-900 mb-6'>Создать новый регламент</h2>
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
            <label className='block text-sm font-medium text-gray-700 mb-1'>Содержание</label>
            <textarea
              {...register('content', { required: true })}
              rows={6}
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Ключевые слова</label>
            <input
              type='text'
              {...register('keywords', { required: true })}
              placeholder='Введите ключевые слова через запятую'
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Категория</label>
            <select
              {...register('groupId', { required: true })}
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className={`w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Создание...' : 'Создать регламент'}
          </button>
        </form>
      </div>

      <div className='space-y-4'>
        <h2 className='text-xl font-medium text-gray-900'>Существующие регламенты</h2>
        {regulations.map((regulation: any) => (
          <div key={regulation.id} className='bg-white shadow-sm rounded-lg p-6'>
            <div className='flex justify-between items-start mb-4'>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>{regulation.title}</h3>
                <p className='text-sm text-gray-500'>{regulation.group.name}</p>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => router.push(`/admin/regulations/${regulation.id}/edit`)}
                  className='px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200'
                >
                  Изменить
                </button>
                <button
                  onClick={() => handleDelete(regulation.id)}
                  className='px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200'
                >
                  Удалить
                </button>
              </div>
            </div>
            <p className='text-sm text-gray-600 mb-2'>{regulation.content}</p>
            <div className='flex flex-wrap gap-2'>
              {regulation.keywords.map((keyword: string) => (
                <span key={keyword} className='px-2 py-1 text-xs bg-gray-100 rounded-full'>
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
