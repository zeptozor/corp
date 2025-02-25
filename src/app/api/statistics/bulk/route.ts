import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const results = await Promise.all(
      data.map(async (monthData: any) => {
        return prisma.monthlyStatistics.upsert({
          where: {
            month_year: {
              month: monthData.month,
              year: monthData.year,
            },
          },
          update: {
            netIncome: monthData.netIncome,
            commissions: monthData.commissions,
            numberOfOrders: monthData.numberOfOrders,
            avgOrdersPerUser: monthData.avgOrdersPerUser,
            avgTicketValue: monthData.avgTicketValue,
          },
          create: {
            month: monthData.month,
            year: monthData.year,
            netIncome: monthData.netIncome,
            commissions: monthData.commissions,
            numberOfOrders: monthData.numberOfOrders,
            avgOrdersPerUser: monthData.avgOrdersPerUser,
            avgTicketValue: monthData.avgTicketValue,
          },
        })
      })
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error('Statistics bulk update error:', error)
    return NextResponse.json({ error: 'Failed to update statistics. Please check your input values.' }, { status: 500 })
  }
}
