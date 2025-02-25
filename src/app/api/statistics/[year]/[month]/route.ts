import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { year: string; month: string } }) {
  try {
    const statistics = await prisma.monthlyStatistics.findFirst({
      where: {
        year: parseInt(params.year),
        month: params.month,
      },
    })

    return NextResponse.json(statistics)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}
