'use client'

import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatisticsChart } from '@/components/ui/statistics-chart'
import { useState } from 'react'

const metrics = [
  { key: 'netIncome', label: 'Чистый доход', color: '#8884d8' },
  { key: 'commissions', label: 'Комиссии', color: '#82ca9d' },
  { key: 'numberOfOrders', label: 'Количество заказов', color: '#ffc658' },
  { key: 'avgOrdersPerUser', label: 'Среднее количество заказов на пользователя', color: '#ff7300' },
  { key: 'avgTicketValue', label: 'Средний чек', color: '#8dd1e1' },
]

export default function StatisticsPage() {
  const [chartType, setChartType] = useState('line')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Статистика</h1>
        <div className='flex gap-4'>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Выберите тип графика' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='line'>Линейный график</SelectItem>
              <SelectItem value='bar'>Столбчатый график</SelectItem>
              <SelectItem value='pie'>Круговая диаграмма</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
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
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {metrics.map((metric) => (
          <Card key={metric.key} className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>{metric.label}</h2>
            <StatisticsChart
              type={chartType as 'line' | 'bar' | 'pie'}
              metric={metric.key}
              color={metric.color}
              year={selectedYear}
            />
          </Card>
        ))}
      </div>
    </div>
  )
}
