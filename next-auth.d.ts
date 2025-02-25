import { UserRole } from '@prisma/client'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      photo: string
      telegram: string
      name: string
      role: UserRole
      groupNumber: number | null
      email1: string
      email2: string
      birthDate: Date
      employmentDate: Date
    }
  }
  interface User {
    id: string
    photo: string
    telegram: string
    name: string
    role: UserRole
    email1: string
    email2: string
    birthDate: Date
    employmentDate: Date
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    photo: string
    telegram: string
    name: string
    role: UserRole
    groupNumber: number | null
    email1: string
    email2: string
    birthDate: Date
    employmentDate: Date
  }
}
