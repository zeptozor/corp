'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface LinkForm {
  title: string
  url: string
}

export default function AdminLinksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [links, setLinks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm<LinkForm>()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/')
    }
    fetchLinks()
  }, [session, router, status])

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links')
      if (response.ok) {
        const data = await response.json()
        setLinks(data)
      }
    } catch (error) {
      console.error('Failed to fetch links:', error)
    }
  }

  const onSubmit = async (data: LinkForm) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create link')
      }

      toast.success('Ссылка создана')
      reset()
      fetchLinks()
    } catch (error) {
      toast.error('Ошибка при создании ссылки')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (linkId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту ссылку?')) return

    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete link')

      toast.success('Ссылка удалена')
      fetchLinks()
    } catch (error) {
      toast.error('Ошибка при удалении ссылки')
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
      <h1 className='text-2xl font-semibold text-gray-900 mb-8'>Управление ссылками</h1>

      <div className='bg-white shadow-sm rounded-lg p-6 mb-8'>
        <h2 className='text-xl font-medium text-gray-900 mb-6'>Добавить новую ссылку</h2>
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

          <button
            type='submit'
            disabled={isLoading}
            className={`w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Создание...' : 'Создать ссылку'}
          </button>
        </form>
      </div>

      <div className='space-y-4'>
        <h2 className='text-xl font-medium text-gray-900'>Существующие ссылки</h2>
        {links.map((link: any) => (
          <div key={link.id} className='bg-white shadow-sm rounded-lg p-6'>
            <div className='flex justify-between items-center'>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>{link.title}</h3>
                <a
                  href={link.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm text-indigo-600 hover:text-indigo-800'
                >
                  {link.url}
                </a>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => router.push(`/admin/links/${link.id}/edit`)}
                  className='px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200'
                >
                  Изменить
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  className='px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200'
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
