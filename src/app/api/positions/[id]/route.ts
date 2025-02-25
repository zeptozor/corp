import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Position ID is required' }, { status: 400 })
    }

    const position = await prisma.position.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            role: true,
            photo: true,
          },
        },
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
      },
    })

    if (!position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    return NextResponse.json(position)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch position' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()

    const position = await prisma.position.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        regulations: {
          set: data.regulations.map((id: string) => ({ id })),
        },
      },
      include: {
        regulations: true,
      },
    })

    return NextResponse.json(position)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update position' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    await prisma.position.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Position deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete position' }, { status: 500 })
  }
}
