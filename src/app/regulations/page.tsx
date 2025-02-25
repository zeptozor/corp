'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import Link from 'next/link'
import { Regulation, RegulationGroup } from '@/types'
import Header from '@/components/ui/header'

export default function RegulationsPage() {
  const [regulations, setRegulations] = useState<Regulation[]>([])
  const [groups, setGroups] = useState<RegulationGroup[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [debouncedSearch] = useDebounce(searchTerm, 500)

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/regulations/groups')
        if (!response.ok) throw new Error('Failed to fetch groups')
        setGroups(await response.json())
      } catch {
        setError('Не удалось загрузить категории регламентов')
      }
    }
    fetchGroups()
  }, [])

  useEffect(() => {
    const fetchRegulations = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(selectedGroup && { groupId: selectedGroup }),
        })

        const response = await fetch(`/api/regulations?${params}`)
        if (!response.ok) throw new Error('Failed to fetch regulations')
        setRegulations(await response.json())
      } catch {
        setError('Не удалось загрузить регламенты')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRegulations()
  }, [debouncedSearch, selectedGroup])

  const renderGroupTree = (groups: RegulationGroup[], level = 0) => {
    return groups.map((group) => (
      <div key={group.id} style={{ marginLeft: `${level * 1.5}rem` }}>
        <button
          onClick={() => setSelectedGroup(group.id)}
          className={`text-left py-2 px-4 w-full hover:bg-gray-50 ${
            selectedGroup === group.id ? 'bg-blue-50 text-blue-600' : ''
          }`}
        >
          {group.name}
        </button>
        {group.children && renderGroupTree(group.children, level + 1)}
      </div>
    ))
  }

  return (
    <>
      <Header />
      <div className='w-full py-8 px-[20px] md:px-[80px] flex gap-[30px]'>
        <div className='w-[200px] flex-shrink-0'>
          <h2 className='text-lg font-semibold mb-4'>Категории</h2>
          <div className='space-y-1'>
            <button
              onClick={() => setSelectedGroup(null)}
              className={`text-left py-2 px-4 w-full hover:bg-gray-50 ${
                !selectedGroup ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              Все категории
            </button>
            {renderGroupTree(groups)}
          </div>
        </div>
        <div className='flex-1'>
          <div className='rounded-lg shadow-sm p-6'>
            <input
              type='text'
              placeholder='Поиск регламентов...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full mb-6 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
            {isLoading ? (
              <div className='w-full flex justify-center py-[20px]'>
                <div className='border-y-3 border-x rounded-full border-blue-600 animate-spin size-[40px]' />
              </div>
            ) : error ? (
              <div className='text-red-500 text-center py-8'>{error}</div>
            ) : (
              <div className='space-y-6'>
                {regulations.map((regulation) => (
                  <Link
                    key={regulation.id}
                    href={`/regulations/${regulation.id}`}
                    className='block border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors'
                  >
                    <h3 className='text-lg font-medium mb-2'>{regulation.title}</h3>
                    <p className='text-gray-600 mb-4 line-clamp-2'>{regulation.content}</p>
                    <div className='flex items-center justify-between'>
                      <div className='text-sm text-gray-500'>{regulation.group.name}</div>
                      <div className='flex gap-2'>
                        {regulation.keywords.map((keyword) => (
                          <span key={keyword} className='px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full'>
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
