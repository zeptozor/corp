'use client'

import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const months = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

interface StatisticsForm {
  [key: string]: {
    netIncome: number
    commissions: number
    numberOfOrders: number
    avgOrdersPerUser: number
    avgTicketValue: number
  }
}

export default function AddStatisticsPage() {
  const router = useRouter()
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset, setValue } = useForm<StatisticsForm>()

  useEffect(() => {
    if (selectedYear) {
      fetch(`/api/statistics/${selectedYear}`)
        .then((res) => res.json())
        .then((data) => {
          months.forEach((month) => {
            const monthData = data.find((item: any) => item.month === month)
            if (monthData) {
              setValue(`${month}.netIncome`, monthData.netIncome)
              setValue(`${month}.commissions`, monthData.commissions)
              setValue(`${month}.numberOfOrders`, monthData.numberOfOrders)
              setValue(`${month}.avgOrdersPerUser`, monthData.avgOrdersPerUser)
              setValue(`${month}.avgTicketValue`, monthData.avgTicketValue)
            } else {
              setValue(`${month}.netIncome`, 0)
              setValue(`${month}.commissions`, 0)
              setValue(`${month}.numberOfOrders`, 0)
              setValue(`${month}.avgOrdersPerUser`, 0)
              setValue(`${month}.avgTicketValue`, 0)
            }
          })
        })
    }
  }, [selectedYear, setValue])

  const onSubmit = async (data: StatisticsForm) => {
    setIsLoading(true)
    try {
      const monthsData = Object.entries(data).map(([month, values]) => ({
        month,
        year: parseInt(selectedYear),
        ...values,
      }))

      const response = await fetch('/api/statistics/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(monthsData),
      })

      if (!response.ok) throw new Error('Failed to save statistics')

      toast.success('Статистика успешно сохранена')
      router.push('/admin/statistics')
      router.refresh()
    } catch (error) {
      toast.error('Не удалось сохранить статистику')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='p-6'>
      <Card className='max-w-4xl mx-auto p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold'>Редактировать статистику за год</h1>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Выберите год' />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {months.map((month) => (
            <div key={month} className='border rounded-lg p-4'>
              <h2 className='text-xl font-semibold mb-4'>{month}</h2>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>Чистый доход</label>
                  <input
                    type='number'
                    step='0.01'
                    {...register(`${month}.netIncome`, { valueAsNumber: true })}
                    className='w-full p-2 border rounded-md'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>Комиссии</label>
                  <input
                    type='number'
                    step='0.01'
                    {...register(`${month}.commissions`, { valueAsNumber: true })}
                    className='w-full p-2 border rounded-md'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>Количество заказов</label>
                  <input
                    type='number'
                    {...register(`${month}.numberOfOrders`, { valueAsNumber: true })}
                    className='w-full p-2 border rounded-md'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>Среднее количество заказов</label>
                  <input
                    type='number'
                    step='0.01'
                    {...register(`${month}.avgOrdersPerUser`, { valueAsNumber: true })}
                    className='w-full p-2 border rounded-md'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>Средний чек</label>
                  <input
                    type='number'
                    step='0.01'
                    {...register(`${month}.avgTicketValue`, { valueAsNumber: true })}
                    className='w-full p-2 border rounded-md'
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Сохранение...' : 'Сохранить статистику'}
          </button>
        </form>
      </Card>
    </div>
  )
}
