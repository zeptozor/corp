import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/utils'

export async function POST(request: Request, { params }: { params: any }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const userId = session.user.id
    const { id: postId } = await params

    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        postId,
      },
    })

    if (existingLike)
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      })
    else
      await prisma.like.create({
        data: {
          userId,
          postId,
        },
      })

    const likes = await prisma.like.findMany({ where: { postId } })

    return NextResponse.json(likes)
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json({ error: 'Failed to process like' }, { status: 500 })
  }
}
