import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const groupId = searchParams.get('groupId')

  try {
    const regulations = await prisma.regulation.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [{ title: { contains: search, mode: 'insensitive' } }, { keywords: { hasSome: [search] } }],
              }
            : {},
          groupId ? { groupId } : {},
        ],
      },
      include: {
        group: true,
        positions: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    })

    return NextResponse.json(regulations)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch regulations' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const regulation = await prisma.regulation.create({
      data: {
        title: data.title,
        content: data.content,
        keywords: data.keywords,
        groupId: data.groupId,
      },
      include: {
        group: true,
      },
    })

    return NextResponse.json(regulation)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create regulation' }, { status: 500 })
  }
}
