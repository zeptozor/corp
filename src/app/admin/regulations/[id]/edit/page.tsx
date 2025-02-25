'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
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

export default function EditRegulationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [groups, setGroups] = useState<RegulationGroup[]>([])
  const { register, handleSubmit, reset, setValue } = useForm<RegulationForm>()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/')
    }
    fetchRegulation()
    fetchGroups()
  }, [session, router, status])

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

  const fetchRegulation = async () => {
    try {
      const response = await fetch(`/api/regulations/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch regulation')
      const regulation = await response.json()

      setValue('title', regulation.title)
      setValue('content', regulation.content)
      setValue('keywords', regulation.keywords.join(', '))
      setValue('groupId', regulation.groupId)
    } catch (error) {
      toast.error('Failed to load regulation')
      router.push('/admin/regulations')
    }
  }

  const onSubmit = async (data: RegulationForm) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/regulations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          keywords: data.keywords.split(',').map((k) => k.trim()),
        }),
      })

      if (!response.ok) throw new Error('Failed to update regulation')

      toast.success('Регламент обновлен')
      router.push('/admin/regulations')
    } catch (error) {
      toast.error('Ошибка при обновлении регламента')
    } finally {
      setIsLoading(false)
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
      <h1 className='text-2xl font-semibold text-gray-900 mb-8'>Редактировать регламент</h1>

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
              onClick={() => router.push('/admin/regulations')}
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
