import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Feedback() {
  const { data: session } = useSession()
  const router = useRouter()
  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    if (message.trim() == '') return
    if (!session?.user) {
      router.push('/signin')
      return
    }
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Не удалось отправить обратную связь')
      }
      toast.success('Обратная связь отправлена')
      setMessage('')
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error(error instanceof Error ? error.message : 'Не удалось отправить обратную связь')
    }
  }

  return (
    <section className='w-full flex flex-col px-[20px] md:px-[80px] py-[20px]'>
      <h2 className='text-2xl font-medium'>Обратная связь</h2>
      <textarea
        className='w-full mt-5 resize-y max-h-[400px] bg-none outline-none border-2 p-4 border-gray-200 rounded-md min-h-[200px]'
        placeholder='Напишите ваши пожелания...'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button className='self-end px-[10px] py-[5px] rounded-md bg-blue-500 mt-[20px]' onClick={sendMessage}>
        Отправить
      </button>
    </section>
  )
}
