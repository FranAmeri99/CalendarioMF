import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/userService'
import { TeamService } from '@/lib/services/teamService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const id = searchParams.get('id')

    // Si se proporciona email, buscar usuario por email
    if (email) {
      const user = await UserService.getUserByEmail(email)
      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        )
      }
      return NextResponse.json(user)
    }

    // Si se proporciona ID, buscar usuario por ID
    if (id) {
      const user = await UserService.getUserById(id)
      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        )
      }
      return NextResponse.json(user)
    }

    // Si no se proporciona email ni ID, obtener todos los usuarios
    const [users, teams] = await Promise.all([
      UserService.getAllUsers(),
      TeamService.getSimpleTeams(),
    ])

    return NextResponse.json({ users, teams })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, teamId } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const user = await UserService.createUser({
      name,
      email,
      password,
      role: role || 'USER',
      teamId: teamId || undefined,
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Error al crear el usuario' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, password, role, teamId } = body

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: 'ID, nombre y email son requeridos' },
        { status: 400 }
      )
    }

    const user = await UserService.updateUser(id, {
      name,
      email,
      password: password || undefined,
      role: role || 'USER',
      teamId: teamId || undefined,
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el usuario' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de usuario es requerido' },
        { status: 400 }
      )
    }

    await UserService.deleteUser(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el usuario' },
      { status: 500 }
    )
  }
} 