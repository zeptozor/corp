'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthError() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (!error) {
      router.push('/auth/signin')
    }
  }, [error, router])

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'You do not have permission to access this resource.'
      case 'Verification':
        return 'The verification failed. Please try again.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  if (!error) return null

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-red-600 mb-4'>Authentication Error</h2>
          <p className='text-gray-600 mb-6'>{getErrorMessage(error)}</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          >
            Return to Sign In
          </button>
        </div>
      </div>
    </div>
  )
}
