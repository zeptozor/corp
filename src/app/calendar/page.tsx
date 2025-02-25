'use client'

import { useEffect, useState } from 'react'
import { format, differenceInDays } from 'date-fns'
import Link from 'next/link'
import { Event } from '@/types'
import Header from '@/components/ui/header'

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (!response.ok) throw new Error('Failed to fetch events')
        setEvents(await response.json())
      } catch {
        setError('Не удалось загрузить данные')
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const getUpcomingEvents = () => {
    const now = new Date()
    return events
      .filter((event) => new Date(event.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const getTimeUntilEvent = (eventDate: string) => {
    const days = differenceInDays(new Date(eventDate), new Date())
    if (days === 0) return 'Сегодня'
    if (days === 1) return 'Завтра'
    return `${days} дней`
  }
  const upcomingEvents = getUpcomingEvents()

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='border-y-3 border-x rounded-full border-blue-600 animate-spin size-[40px]' />
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className='py-[20px] px-[20px] md:px-[80px]'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-1'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Предстоящие события</h2>
            <div className='space-y-4'>
              {upcomingEvents.length === 0 ? (
                <p className='text-gray-500'>Нет предстоящих событии</p>
              ) : (
                upcomingEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className='border-l-4 border-blue-500 pl-4 py-2'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <h3 className='font-medium text-gray-900'>{event.title}</h3>
                        <p className='text-sm text-gray-500'>{format(new Date(event.date), 'MMMM d, yyyy')}</p>
                        {event.user && (
                          <Link href={`/users/${event.user.id}`} className='text-sm text-blue-600 hover:text-blue-500'>
                            {event.user.name}
                          </Link>
                        )}
                      </div>
                      <span className='text-sm font-medium text-blue-600'>{getTimeUntilEvent(event.date)}</span>
                    </div>
                    {event.description && <p className='mt-1 text-sm text-gray-600'>{event.description}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className='lg:col-span-2'>
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h2 className='text-lg font-semibold mb-4'>Календарь</h2>
              <div className='space-y-4'>
                {events.map((event) => (
                  <div key={event.id} className='flex items-center p-4 border border-gray-200 rounded-lg'>
                    <div className='flex-1'>
                      <h3 className='font-medium'>{event.title}</h3>
                      <p className='text-sm text-gray-500'>{format(new Date(event.date), 'MMMM d, yyyy')}</p>
                    </div>
                    <span className='text-sm text-gray-500'>{event.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
