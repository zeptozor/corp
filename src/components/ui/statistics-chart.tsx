'use client'

import { useEffect, useState } from 'react'
import {
  Line,
  Bar,
  Pie,
  LineChart,
  BarChart,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

type ChartType = 'line' | 'bar' | 'pie'

interface StatisticsChartProps {
  type: ChartType
  metric: string
  color: string
  year: number
}

export function StatisticsChart({ type, metric, color, year }: StatisticsChartProps) {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch(`/api/statistics?year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        // Transform data for the specific metric
        const transformedData = data.map((item: any) => ({
          month: item.month,
          value: item[metric],
        }))
        setData(transformedData)
      })
  }, [metric, year])

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='month' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type='monotone' dataKey='value' stroke={color} />
          </LineChart>
        )
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='month' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey='value' fill={color} />
          </BarChart>
        )
      case 'pie':
        return (
          <PieChart>
            <Pie data={data} dataKey='value' nameKey='month' cx='50%' cy='50%' outerRadius={100} fill={color} label />
            <Tooltip />
          </PieChart>
        )
    }
  }

  return (
    <div className='w-full h-[300px]'>
      <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
    </div>
  )
}
