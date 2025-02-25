import { User } from '@/types'
import Link from 'next/link'

export default function UserCard({ user }: { user: User }) {
  return (
    <div
      className={`w-full flex flex-col md:flex-row gap-[20px] ${
        user.isOwner ? 'border-l-4 border-l-blue-600' : 'pl-[4px]'
      } border-b border-b-200`}
    >
      <img src={`/${user.photo}`} className='size-full rounded-full md:rounded-none md:size-[100px]' />
      <div className='w-full flex flex-col gap-[10px] py-[10px]'>
        <div className='w-full flex justify-between items-center'>
          <Link href={`/users/${user.id}`} className='text-lg'>
            {user.name}
          </Link>
          <a
            target='_blank'
            href={`tg://resolve?domain=${user.telegram}`}
            className='rounded-full bg-blue-500/70 px-[5px] py-[2px]'
          >
            @{user.telegram}
          </a>
        </div>
        <div className='w-full flex flex-wrap gap-[10px]'>
          {user.positions.map((position) => (
            <Link
              href={`/positions/${position.id}`}
              key={position.id}
              className='rounded-full bg-yellow-400/70 px-[5px] py-[2px]'
            >
              {position.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
