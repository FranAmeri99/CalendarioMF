import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/userService'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { teamId } = await request.json()

    if (!teamId) {
      return NextResponse.json(
        { error: 'teamId es requerido' },
        { status: 400 }
      )
    }

    await UserService.addUserToTeam(id, teamId)

    return NextResponse.json({ message: 'Usuario agregado al equipo exitosamente' })
  } catch (error) {
    console.error('Error adding user to team:', error)
    return NextResponse.json(
      { error: 'Error al agregar usuario al equipo' },
      { status: 500 }
    )
  }
}
