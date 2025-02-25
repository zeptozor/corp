'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface PostForm {
  title: string
  content: string
  type: 'announcement' | 'event' | 'achievement' | 'plan'
  status?: 'pending' | 'in_progress' | 'completed'
  dueDate?: string
  eventDate?: string
}

export default function EditPostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset, watch, setValue } = useForm<PostForm>()
  const postType = watch('type')

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/')
    }
    fetchPost()
  }, [session, router, status])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch post')
      const post = await response.json()

      setValue('title', post.title)
      setValue('content', post.content)
      setValue('type', post.type)
      if (post.status) setValue('status', post.status)
      if (post.dueDate) setValue('dueDate', new Date(post.dueDate).toISOString().split('T')[0])
      if (post.eventDate) setValue('eventDate', new Date(post.eventDate).toISOString().slice(0, 16))
    } catch (error) {
      toast.error('Failed to load post')
      router.push('/admin/posts')
    }
  }

  const onSubmit = async (data: PostForm) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update post')

      toast.success('Пост обновлен')
      router.push('/admin/posts')
    } catch (error) {
      toast.error('Ошибка при обновлении поста')
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
      <h1 className='text-2xl font-semibold text-gray-900 mb-8'>Редактировать пост</h1>

      <div className='bg-white shadow-sm rounded-lg p-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Заголовок</label>
              <input
                type='text'
                {...register('title', { required: true })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              />
            </div>

            <div className='col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Содержание</label>
              <textarea
                {...register('content', { required: true })}
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Тип</label>
              <select {...register('type')} className='w-full px-3 py-2 border border-gray-300 rounded-md'>
                <option value='announcement'>Объявление</option>
                <option value='event'>Событие</option>
                <option value='achievement'>Достижение</option>
                <option value='plan'>План</option>
              </select>
            </div>

            {postType === 'plan' && (
              <>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Статус</label>
                  <select {...register('status')} className='w-full px-3 py-2 border border-gray-300 rounded-md'>
                    <option value='pending'>В ожидании</option>
                    <option value='in_progress'>В процессе</option>
                    <option value='completed'>Завершено</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Срок выполнения</label>
                  <input
                    type='date'
                    {...register('dueDate')}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  />
                </div>
              </>
            )}

            {postType === 'event' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Дата события</label>
                <input
                  type='datetime-local'
                  {...register('eventDate')}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                />
              </div>
            )}
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
              onClick={() => router.push('/admin/posts')}
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
