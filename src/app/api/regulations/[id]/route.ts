import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params // Remove 'await', directly destructure from params
    if (!id) {
      return NextResponse.json({ error: 'Regulation ID is required' }, { status: 400 })
    }

    const regulation = await prisma.regulation.findUnique({
      where: { id },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!regulation) {
      return NextResponse.json({ error: 'Regulation not found' }, { status: 404 })
    }

    return NextResponse.json(regulation)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch regulation' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params // Correct params destructuring
    const data = await request.json()

    const regulation = await prisma.regulation.update({
      where: { id },
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
    return NextResponse.json({ error: 'Failed to update regulation' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params // Correct params destructuring
    await prisma.regulation.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Regulation deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete regulation' }, { status: 500 })
  }
}
