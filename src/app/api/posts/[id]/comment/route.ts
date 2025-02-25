import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { content } = await request.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })

    const { id: postId } = await params
    const userId = session.user.id

    await prisma.comment.create({
      data: {
        content,
        postId,
        userId,
      },
    })

    const comments = await prisma.comment.findMany({ where: { postId }, include: { user: true } })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Comment error:', error)
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
  }
}
