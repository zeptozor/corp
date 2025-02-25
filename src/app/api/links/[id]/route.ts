import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: any }) {
  try {
    const { id } = params
    const link = await prisma.link.findUnique({
      where: { id },
    })

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    return NextResponse.json(link)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch link' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: any }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || ['ceo', 'owner'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()
    const link = await prisma.link.update({
      where: { id },
      data: {
        title: data.title,
        url: data.url,
      },
    })

    return NextResponse.json(link)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || ['ceo', 'owner'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    await prisma.link.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Link deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 })
  }
}
