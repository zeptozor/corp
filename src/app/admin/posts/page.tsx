'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface PostForm {
  title: string
  content: string
  type: 'announcement' | 'event' | 'achievement' | 'plan'
  status?: 'pending' | 'in_progress' | 'completed'
  dueDate?: string
  eventDate?: string
}

export default function AdminPostsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset, watch } = useForm<PostForm>()
  const postType = watch('type')

  useEffect(() => {
    if (status === 'authenticated' && ['ceo', 'owner'].includes(session.user.role)) {
      router.push('/')
    }
    fetchPosts()
  }, [session, router, status])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
  }

  const onSubmit = async (data: PostForm) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      toast.success('Пост создан успешно')
      reset()
      fetchPosts()
    } catch (error) {
      toast.error('Ошибка при создании поста')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete post')

      toast.success('Пост удален')
      fetchPosts()
    } catch (error) {
      toast.error('Ошибка при удалении поста')
    }
  }

  if (status === 'loading') {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500' />
      </div>
    )
  }

  if (status !== 'authenticated' || ['ceo', 'owner'].includes(session.user.role)) return null

  return (
    <div className='max-w-4xl mx-auto py-8 px-4'>
      <h1 className='text-2xl font-semibold text-gray-900 mb-8'>Управление постами</h1>

      <div className='bg-white shadow-sm rounded-lg p-6 mb-8'>
        <h2 className='text-xl font-medium text-gray-900 mb-6'>Создать новый пост</h2>
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

          <button
            type='submit'
            disabled={isLoading}
            className={`w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Создание...' : 'Создать пост'}
          </button>
        </form>
      </div>

      <div className='space-y-4'>
        <h2 className='text-xl font-medium text-gray-900'>Существующие посты</h2>
        {posts.map((post: any) => (
          <div key={post.id} className='bg-white shadow-sm rounded-lg p-6'>
            <div className='flex justify-between items-start mb-4'>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>{post.title}</h3>
                <p className='text-sm text-gray-500'>{format(new Date(post.createdAt), 'dd.MM.yyyy HH:mm')}</p>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
                  className='px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200'
                >
                  Изменить
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className='px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200'
                >
                  Удалить
                </button>
              </div>
            </div>
            <p className='text-gray-600'>{post.content}</p>
            {post.type === 'plan' && (
              <div className='mt-2'>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    post.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : post.status === 'in_progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {post.status}
                </span>
                {post.dueDate && (
                  <span className='ml-2 text-sm text-gray-500'>
                    Срок: {format(new Date(post.dueDate), 'dd.MM.yyyy')}
                  </span>
                )}
              </div>
            )}
            {post.type === 'event' && post.eventDate && (
              <div className='mt-2'>
                <span className='text-sm text-gray-500'>
                  Дата события: {format(new Date(post.eventDate), 'dd.MM.yyyy HH:mm')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
