import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  try {
    const posts = await prisma.post.findMany({
      where: type && type !== 'all' ? { type } : {},
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    if (data.eventDate) {
      const event = await prisma.event.create({
        data: {
          title: data.title,
          type: data.type,
          date: new Date(data.eventDate),
        },
      })
      return NextResponse.json(event)
    } else {
      const post = await prisma.post.create({
        data: {
          title: data.title,
          content: data.content,
          type: data.type,
          status: data.type === 'plan' ? data.status : undefined,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          authorId: session.user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
      return NextResponse.json(post)
    }
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
