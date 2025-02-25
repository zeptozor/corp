'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()
  return (
    <header className='w-full px-[20px] md:px-[80px] py-[20px] flex justify-between items-center'>
      <Link href='/' className='text-xl'>
        Сайт для офисных работников
      </Link>
      <div className='flex gap-[20px] items-center'>
        <Link href='/positions'>Должности</Link>
        <Link href='/regulations'>Регламенты</Link>
        <Link href='/calendar'>Календарь</Link>
        <Link href='/news'>Новости</Link>
        {session?.user ? (
          <div className='size-[40px] rounded-full flex justify-center items-center'>
            <img src={`/${session.user.photo}`} className='size-full rounded-full bg-red-500' />
          </div>
        ) : (
          <Link href='/signin'>Войти</Link>
        )}
      </div>
    </header>
  )
}
