import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const statistics = await prisma.monthlyStatistics.findMany({
      orderBy: {
        month: 'asc',
      },
    })

    return NextResponse.json(statistics)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (
      !data.month ||
      !data.netIncome ||
      !data.commissions ||
      !data.numberOfOrders ||
      !data.avgOrdersPerUser ||
      !data.avgTicketValue
    ) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Convert string values to numbers
    const statistics = await prisma.monthlyStatistics.create({
      data: {
        month: data.month,
        year: data.year,
        netIncome: Number(data.netIncome),
        commissions: Number(data.commissions),
        numberOfOrders: Number(data.numberOfOrders),
        avgOrdersPerUser: Number(data.avgOrdersPerUser),
        avgTicketValue: Number(data.avgTicketValue),
      },
    })

    return NextResponse.json(statistics)
  } catch (error) {
    console.error('Statistics creation error:', error)
    return NextResponse.json({ error: 'Failed to create statistics. Please check your input values.' }, { status: 500 })
  }
}
