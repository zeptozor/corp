import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: any }) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: any }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || ['ceo', 'owner'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { id } = await params
    if (data.eventDate) {
      const event = prisma.event.update({
        where: { id },
        data: {
          date: new Date(data.eventDate),
          title: data.title,
          type: data.type,
        },
      })
      return NextResponse.json(event)
    } else {
      const post = await prisma.post.update({
        where: { id },
        data: {
          title: data.title,
          content: data.content,
          type: data.type,
          status: data.type === 'plan' ? data.status : undefined,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        },
      })
      return NextResponse.json(post)
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: any }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || ['ceo', 'owner'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.post.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
