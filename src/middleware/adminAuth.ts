import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function adminAuthMiddleware(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // Verificar si el usuario está autenticado
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Verificar si el usuario es administrador
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Error en middleware de admin:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
} 