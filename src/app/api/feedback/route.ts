import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const feedback = await prisma.feedback.findMany({
      where: {
        userId: (session.user as any).id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(feedback)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const { content } = await request.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Feedback content is required' }, { status: 400 })

    const feedback = await prisma.feedback.create({
      data: {
        content,
        userId: session.user.id,
      },
    })

    return NextResponse.json(feedback)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
