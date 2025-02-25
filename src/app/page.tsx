'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { User } from '@/types'
import Header from '@/components/ui/header'
import UserCard from '@/components/ui/user-card'
import Feedback from '@/components/ui/feedback'

interface Link {
  id: string
  title: string
  url: string
}

export default function HomePage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [links, setLinks] = useState<Link[]>([])

  useEffect(() => {
    fetchLinks()
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (!response.ok) throw new Error()
        setUsers(await response.json())
      } catch {
        setError('Не удалось загрузить работников организации')
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [session])

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

  const organizeUsers = (users: User[]) => {
    const owner = users.find((u) => u.role === 'owner')
    const ceo = users.find((u) => u.role === 'ceo')
    const director = users.find((u) => u.role === 'director')

    const group1Leader = users.find((u) => u.role === 'groupLeader' && u.groupNumber === 1)
    const group2Leader = users.find((u) => u.role === 'groupLeader' && u.groupNumber === 2)

    const group1Members = users.filter((u) => u.role === 'member' && u.groupNumber === 1)
    const group2Members = users.filter((u) => u.role === 'member' && u.groupNumber === 2)

    return {
      owner,
      ceo,
      director,
      group1: { leader: group1Leader, members: group1Members },
      group2: { leader: group2Leader, members: group2Members },
    }
  }

  console.log(users)

  return (
    <>
      <Header />
      {isLoading ? (
        <div className='w-full flex justify-center py-[20px]'>
          <div className='border-y-3 border-x rounded-full border-blue-600 animate-spin size-[40px]' />
        </div>
      ) : error ? (
        <div className='w-full flex justify-between py-[20px]'>{error}</div>
      ) : (
        <section className='w-full px-[20px] md:px-[80px] py-[20px]'>
          <h2 className='text-2xl font-medium mb-8'>Структура организации</h2>

          <div className='relative'>
            {/* Tree structure */}
            <div className='flex flex-col items-center'>
              {/* Owner */}
              {organizeUsers(users).owner && (
                <div className='mb-12'>
                  <div className='relative'>
                    <UserCard user={organizeUsers(users).owner!} />
                    <div className='absolute w-px h-8 bg-gray-300 left-1/2 -bottom-8 transform -translate-x-1/2' />
                  </div>
                </div>
              )}

              {/* CEO */}
              {organizeUsers(users).ceo && (
                <div className='mb-12'>
                  <div className='relative'>
                    <UserCard user={organizeUsers(users).ceo!} />
                    <div className='absolute w-px h-8 bg-gray-300 left-1/2 -bottom-8 transform -translate-x-1/2' />
                  </div>
                </div>
              )}

              {/* Director */}
              {organizeUsers(users).director && (
                <div className='mb-12'>
                  <div className='relative'>
                    <UserCard user={organizeUsers(users).director!} />
                    <div className='absolute w-px h-8 bg-gray-300 left-1/2 -bottom-8 transform -translate-x-1/2' />
                  </div>
                </div>
              )}

              {/* Groups Container */}
              <div className='grid grid-cols-2 gap-x-24 w-full max-w-6xl'>
                {/* Group 1 */}
                <div className='relative'>
                  <div className='absolute w-full h-px bg-gray-300 -top-8' />
                  <div className='border rounded-lg p-6'>
                    <h3 className='text-xl font-medium mb-6'>Группа 1</h3>
                    {organizeUsers(users).group1.leader && (
                      <div className='mb-8'>
                        <h4 className='text-lg font-medium mb-4 text-yellow-600'>Руководитель группы</h4>
                        <div className='relative'>
                          <UserCard user={organizeUsers(users).group1.leader!} />
                          <div className='absolute w-px h-8 bg-gray-300 left-1/2 -bottom-8 transform -translate-x-1/2' />
                        </div>
                      </div>
                    )}
                    <div className='space-y-4 pt-8'>
                      <h4 className='text-lg font-medium mb-4'>Участники группы</h4>
                      {organizeUsers(users).group1.members.map((user) => (
                        <UserCard key={user.id} user={user} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Group 2 */}
                <div className='relative'>
                  <div className='absolute w-full h-px bg-gray-300 -top-8' />
                  <div className='border rounded-lg p-6'>
                    <h3 className='text-xl font-medium mb-6'>Группа 2</h3>
                    {organizeUsers(users).group2.leader && (
                      <div className='mb-8'>
                        <h4 className='text-lg font-medium mb-4 text-yellow-600'>Руководитель группы</h4>
                        <div className='relative'>
                          <UserCard user={organizeUsers(users).group2.leader!} />
                          <div className='absolute w-px h-8 bg-gray-300 left-1/2 -bottom-8 transform -translate-x-1/2' />
                        </div>
                      </div>
                    )}
                    <div className='space-y-4 pt-8'>
                      <h4 className='text-lg font-medium mb-4'>Участники группы</h4>
                      {organizeUsers(users).group2.members.map((user) => (
                        <UserCard key={user.id} user={user} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      <Feedback />
      <section className='px-[80px]'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>Полезные ссылки</h2>
        <div className='grid gap-4 md:grid-cols-2'>
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target='_blank'
              rel='noopener noreferrer'
              className='block p-4 bg-white shadow-sm rounded-lg hover:shadow-md transition-shadow'
            >
              <h3 className='text-lg font-medium text-indigo-600'>{link.title}</h3>
              <p className='text-sm text-gray-500 mt-1'>{link.url}</p>
            </a>
          ))}
        </div>
      </section>
    </>
  )
}
