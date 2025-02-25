import { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient, UserRole } from '@prisma/client'
import { compare } from 'bcryptjs'
import { JWT } from 'next-auth/jwt'

const prisma = new PrismaClient()

interface CustomUser {
  id: string
  email: string
  name: string
  role: UserRole
  photo: string
  telegram: string
  isOwner: boolean
  email1: string
  email2: string
  birthDate: Date
  employmentDate: Date
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Почта',
          type: 'email',
          placeholder: 'email@example.com',
        },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            include: {
              positions: true,
            },
          })

          if (!user) return null

          const isPasswordValid = await compare(credentials.password, user.password)

          if (!isPasswordValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            photo: user.photo,
            telegram: user.telegram,
            isOwner: user.isOwner,
            email1: user.email1,
            email2: user.email2,
            birthDate: user.birthDate,
            employmentDate: user.employmentDate,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/signin',
    error: '/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.photo = user.photo
        token.telegram = user.telegram
        token.isOwner = user.isOwner
        token.email1 = user.email1
        token.email2 = user.email2
        token.birthDate = user.birthDate
        token.employmentDate = user.employmentDate
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.role = token.role
        session.user.photo = token.photo
        session.user.telegram = token.telegram
        session.user.isOwner = token.isOwner
        session.user.email1 = token.email1
        session.user.email2 = token.email2
        session.user.birthDate = token.birthDate
        session.user.employmentDate = token.employmentDate
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
