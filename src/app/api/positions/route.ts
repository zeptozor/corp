import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: Request) {
  try {
    const positions = await prisma.position.findMany({
      include: {
        regulations: {
          select: {
            id: true,
            title: true,
            group: {
              select: {
                name: true,
              },
            },
          },
        },
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(positions)
  } catch (error) {
    console.error('Positions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const position = await prisma.position.create({
      data: {
        title: data.title,
        description: data.description,
        regulations: {
          connect: data.regulations.map((id: string) => ({ id })),
        },
      },
      include: {
        regulations: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json(position)
  } catch (error) {
    console.error('Create position error:', error)
    return NextResponse.json({ error: 'Failed to create position' }, { status: 500 })
  }
}
