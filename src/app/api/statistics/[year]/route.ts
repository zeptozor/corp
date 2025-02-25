import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { year: string } }) {
  try {
    const { year } = params
    const statistics = await prisma.monthlyStatistics.findMany({
      where: {
        year: parseInt(year),
      },
      orderBy: {
        month: 'asc',
      },
    })

    return NextResponse.json(statistics || [])
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json([], { status: 500 })
  }
}
