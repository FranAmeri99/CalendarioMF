import { NextRequest, NextResponse } from 'next/server'
import { TeamService } from '@/lib/services/teamService'
import { UserService } from '@/lib/services/userService'

export async function GET() {
  try {
    const [teams, users] = await Promise.all([
      TeamService.getAllTeams(),
      UserService.getAllUsers(),
    ])

    return NextResponse.json({ teams, users })
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Error al obtener equipos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, leaderId } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre del equipo es requerido' },
        { status: 400 }
      )
    }

    const team = await TeamService.createTeam({
      name,
      description: description || '',
      leaderId: leaderId || undefined,
    })

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { error: 'Error al crear el equipo' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, leaderId } = body

    if (!id || !name) {
      return NextResponse.json(
        { error: 'ID y nombre del equipo son requeridos' },
        { status: 400 }
      )
    }

    const team = await TeamService.updateTeam(id, {
      name,
      description: description || '',
      leaderId: leaderId || undefined,
    })

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el equipo' },
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
        { error: 'ID de equipo es requerido' },
        { status: 400 }
      )
    }

    await TeamService.deleteTeam(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el equipo' },
      { status: 500 }
    )
  }
} 