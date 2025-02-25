'use client'

import { useEffect, useState } from 'react'
import { Post, PostTypes } from '@/types'
import Header from '@/components/ui/header'
import { Post as PostComponent } from '@/components/ui/post'

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [selectedType])

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams(selectedType !== 'all' ? { type: selectedType } : {})
      const response = await fetch(`/api/posts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch posts')
      setPosts(await response.json())
    } catch {
      setError('Не удалось загрузить новости')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className='max-w-4xl mx-auto py-8 px-4'>
        <div className='mb-8'>
          <h1 className='text-2xl font-semibold mb-4'>Новости организации</h1>
          <div className='flex gap-2'>
            {(Object.keys(PostTypes) as (keyof typeof PostTypes | 'all')[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-md ${
                  selectedType == type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {PostTypes[type]}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className='min-h-screen flex items-center justify-center'>
            <div className='border-y-3 border-x rounded-full border-blue-600 animate-spin size-[40px]' />
          </div>
        ) : error ? (
          <div className='text-red-500 text-center py-8'>{error}</div>
        ) : (
          <div className='space-y-6'>
            {posts.map((post) => (
              <PostComponent post={post} key={post.id} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
