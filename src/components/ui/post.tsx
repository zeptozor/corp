'use client'

import { PlanStatuses, PostTypes, type Post } from '@/types'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function Post({ post }: { post: Post }) {
  const { data: session } = useSession()
  const [likes, setLikes] = useState(post.likes)
  const [comments, setComments] = useState(post.comments)
  const router = useRouter()
  const [comment, setComment] = useState('')

  const handleLike = async () => {
    if (!session?.user) {
      router.push('/signin')
      return
    }
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' })
      if (!response.ok) throw new Error('Не удалось лайкнуть пост')
      const data = await response.json()
      setLikes(data)
    } catch (err) {
      console.error('Error liking the post:', err)
    }
  }

  const handleComment = async () => {
    try {
      if (!comment.trim()) return
      if (!session?.user) {
        router.push('/signin')
        return
      }

      const response = await fetch(`/api/posts/${post.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to add comment')
      setComments(data)
      setComment('')
    } catch (err) {
      console.error('Error adding comment:', err)
    }
  }

  return (
    <div className='bg-white shadow-sm rounded-lg p-6'>
      <div className='flex justify-between items-start mb-4'>
        <div>
          <h2 className='text-lg font-medium'>{post.title}</h2>
          <div className='text-sm text-gray-500'>
            Опубликован пользователем <Link href={`/users/${post.author.id}`}>{post.author.name}</Link> в{' '}
            {format(new Date(post.createdAt), 'MMM d, yyyy')}
          </div>
        </div>
        <span className='px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800'>
          {PostTypes[post.type]}
        </span>
      </div>
      <p className='text-gray-600 mb-4'>{post.content}</p>
      {post.type == 'plan' && post.status && (
        <div className='mb-4'>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              post.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : post.status === 'in_progress'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {PlanStatuses[post.status]}
          </span>
          {post.dueDate && (
            <span className='ml-2 text-sm text-gray-500'>Дедлайн {format(new Date(post.dueDate), 'MMM d, yyyy')}</span>
          )}
        </div>
      )}

      <div className='border-t border-gray-200 pt-4 mt-4'>
        <div className='flex items-center justify-between mb-4'>
          <button
            onClick={() => handleLike()}
            className={`flex items-center ${
              session && likes.some((like) => like.userId == session.user.id)
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <svg
              className='h-5 w-5 mr-1'
              fill={session?.user && likes.some((like) => like.userId == session.user.id) ? 'currentColor' : 'none'}
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
              />
            </svg>
            {likes.length}
          </button>
          <span className='text-sm text-gray-500'>{post.comments.length} комментариев</span>
        </div>
        <div className='space-y-4'>
          {comments.map((comment) => (
            <div key={comment.id} className='flex space-x-3'>
              <div className='flex-1 bg-gray-50 rounded-lg px-4 py-2'>
                <div className='flex items-center justify-between'>
                  <Link href={`/users/${comment.user.id}`} className='text-sm font-medium text-gray-900'>
                    {comment.user.name}
                  </Link>
                  <span className='text-sm text-gray-500'>{format(new Date(comment.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <p className='mt-1 text-sm text-gray-600'>{comment.content}</p>
              </div>
            </div>
          ))}

          <div className='flex space-x-3'>
            <div className='flex-1'>
              <input
                type='text'
                placeholder='Написать комментарий...'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
            </div>
            <button
              onClick={() => handleComment()}
              className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
