import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/userService'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; teamId: string } }
) {
  try {
    const { id, teamId } = params

    await UserService.removeUserFromTeam(id, teamId)

    return NextResponse.json({ message: 'Usuario removido del equipo exitosamente' })
  } catch (error) {
    console.error('Error removing user from team:', error)
    return NextResponse.json(
      { error: 'Error al remover usuario del equipo' },
      { status: 500 }
    )
  }
}
