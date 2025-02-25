import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: {
        title: 'asc',
      },
    })
    return NextResponse.json(links)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || ['ceo', 'owner'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const link = await prisma.link.create({
      data: {
        title: data.title,
        url: data.url,
      },
    })

    return NextResponse.json(link)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
  }
}
