'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface LinkForm {
  title: string
  url: string
}

export default function EditLinkPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, setValue } = useForm<LinkForm>()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/')
    }
    fetchLink()
  }, [session, router, status])

  const fetchLink = async () => {
    try {
      const response = await fetch(`/api/links/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch link')
      const link = await response.json()

      setValue('title', link.title)
      setValue('url', link.url)
    } catch (error) {
      toast.error('Failed to load link')
      router.push('/admin/links')
    }
  }

  const onSubmit = async (data: LinkForm) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/links/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update link')

      toast.success('Ссылка обновлена')
      router.push('/admin/links')
    } catch (error) {
      toast.error('Ошибка при обновлении ссылки')
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
      <h1 className='text-2xl font-semibold text-gray-900 mb-8'>Редактировать ссылку</h1>

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
            <label className='block text-sm font-medium text-gray-700 mb-1'>URL</label>
            <input
              type='url'
              {...register('url', { required: true })}
              className='w-full px-3 py-2 border border-gray-300 rounded-md'
            />
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
              onClick={() => router.push('/admin/links')}
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
