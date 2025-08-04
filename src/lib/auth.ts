import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

// Extender los tipos de NextAuth
declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: string
    teamId?: string
    team?: any
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      teamId?: string
      team?: any
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    teamId?: string
    team?: any
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            team: true
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          teamId: user.teamId || undefined,
          team: user.team
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.teamId = user.teamId
        token.team = user.team
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.teamId = token.teamId as string
        session.user.team = token.team as any
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login'
  }
} 