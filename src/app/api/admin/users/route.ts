import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { hash } from 'bcryptjs'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const photo = formData.get('photo') as File
    const userData = JSON.parse(formData.get('userData') as string)

    let photoFilename = 'default.jpg'

    if (photo) {
      const bytes = await photo.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Save file with unique name
      photoFilename = `${Date.now()}-${photo.name}`
      const photoPath = join(process.cwd(), 'public', photoFilename)
      await writeFile(photoPath, buffer)
    }

    const hashedPassword = await hash(userData.password, 12)

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        photo: photoFilename,
        birthDate: new Date(userData.birthDate),
        employmentDate: new Date(userData.employmentDate),
        positions: {
          connect: userData.positions.map((id: string) => ({ id })),
        },
      },
      include: {
        positions: true,
      },
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
