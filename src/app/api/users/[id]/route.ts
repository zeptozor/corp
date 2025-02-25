import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: any }) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        positions: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
