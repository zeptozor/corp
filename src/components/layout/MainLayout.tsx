'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status == 'unauthenticated') router.push('/signin')
  }, [status, router])

  if (status == 'loading')
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='border-y-3 border-x rounded-full border-blue-600 animate-spin size-[40px]' />
      </div>
    )

  if (!session) return null

  return children
}
