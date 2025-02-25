'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface Position {
  id: string
  title: string
  description: string
}

interface NewUserForm {
  email: string
  password: string
  name: string
  telegram: string
  email1: string
  email2: string
  birthDate: string
  employmentDate: string
  role: 'worker' | 'admin'
  positions: string[] // Add this field
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [positions, setPositions] = useState<Position[]>([])
  const { register, handleSubmit, reset } = useForm<NewUserForm>()

  useEffect(() => {
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
    fetchPositions()
  }, [])

  useEffect(() => {
    if (status == 'authenticated' && session?.user?.role !== 'admin') router.push('/')
  }, [session, router, status])

  if (status == 'loading') {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500' />
      </div>
    )
  }

  if (status != 'authenticated' || session?.user?.role != 'admin') return null

  const onSubmit = async (data: NewUserForm) => {
    try {
      setIsLoading(true)
      const formData = new FormData()

      // Get the photo file from the form
      const photoInput = document.querySelector<HTMLInputElement>('input[type="file"]')
      const photo = photoInput?.files?.[0]

      if (photo) {
        formData.append('photo', photo)
      }

      // Add other user data
      formData.append('userData', JSON.stringify(data))

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Не удалось создать пользователя')
      }

      toast.success('Пользователь создан')
      reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось создать пользователя')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='max-w-4xl mx-auto py-8 px-4'>
      <h1 className='text-2xl font-semibold text-gray-900 mb-8'>Админ панель</h1>

      <div className='bg-white shadow-sm rounded-lg p-6'>
        <h2 className='text-xl font-medium text-gray-900 mb-6'>Создать нового пользователя</h2>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Фото</label>
              <input type='file' accept='image/*' className='w-full px-3 py-2 border border-gray-300 rounded-md' />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Почта (логин)</label>
              <input
                type='email'
                {...register('email', { required: true })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Пароль</label>
              <input
                type='password'
                {...register('password', { required: true })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Имя</label>
              <input
                type='text'
                {...register('name', { required: true })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Telegram</label>
              <input
                type='text'
                {...register('telegram', { required: true })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Почта 1</label>
              <input
                type='email'
                {...register('email1', { required: true })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Почта 2</label>
              <input
                type='email'
                {...register('email2', { required: true })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Дата рождения</label>
              <input
                type='date'
                {...register('birthDate', { required: true })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Дата трудоустроиства</label>
              <input
                type='date'
                {...register('employmentDate', { required: true })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Роль</label>
              <select {...register('role')} className='w-full px-3 py-2 border border-gray-300 rounded-md'>
                <option value='worker'>Сотрудник</option>
                <option value='admin'>Админ</option>
              </select>
            </div>
            <div className='col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Должности</label>
              <select
                multiple
                {...register('positions')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              >
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.title}
                  </option>
                ))}
              </select>
              <p className='text-sm text-gray-500 mt-1'>Используйте Ctrl (Cmd) для выбора нескольких должностей</p>
            </div>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className={`w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Пользователь создается...' : 'Создать'}
          </button>
        </form>
      </div>
    </div>
  )
}
