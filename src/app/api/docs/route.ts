import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const doc = await prisma.documentation.findFirst({
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json(doc || { content: '' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch documentation' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json()

    await prisma.documentation.create({
      data: { content },
    })

    return NextResponse.json({ message: 'Documentation updated successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update documentation' }, { status: 500 })
  }
}
