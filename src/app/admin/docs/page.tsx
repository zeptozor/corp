'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function AdminDocsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.name.split('.')[file.name.split('.').length - 1] !== 'md') {
      toast.error('Please upload a markdown file')
      return
    }

    try {
      setIsLoading(true)
      const content = await file.text()

      const response = await fetch('/api/docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) throw new Error('Failed to upload document')

      toast.success('Documentation updated successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update documentation')
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
      <h1 className='text-2xl font-semibold text-gray-900 mb-8'>Update Documentation</h1>

      <div className='bg-white shadow-sm rounded-lg p-6'>
        <div className='space-y-4'>
          <label className='block'>
            <span className='text-gray-700'>Upload Markdown File</span>
            <input
              type='file'
              accept='.md'
              onChange={handleFileUpload}
              disabled={isLoading}
              className='mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100'
            />
          </label>
          {isLoading && <p className='text-sm text-gray-500'>Uploading...</p>}
        </div>
      </div>
    </div>
  )
}
