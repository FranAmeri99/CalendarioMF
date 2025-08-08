import { NextRequest, NextResponse } from 'next/server'
import { TeamService } from '@/lib/services/teamService'
import { UserService } from '@/lib/services/userService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const simple = searchParams.get('simple')

    // Si se solicita simple, devolver solo equipos básicos
    if (simple === 'true') {
      const teams = await TeamService.getSimpleTeams()
      return NextResponse.json(teams)
    }

    // Si no se solicita simple, devolver equipos completos
    const teams = await TeamService.getAllTeams()
    return NextResponse.json(teams)
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
    const { name, description, leaderId, attendanceDay } = body

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
      attendanceDay: attendanceDay !== undefined ? attendanceDay : undefined,
    })

    return NextResponse.json(team)
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
    const { id, name, description, leaderId, attendanceDay } = body

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
      attendanceDay: attendanceDay !== undefined ? attendanceDay : undefined,
    })

    return NextResponse.json(team)
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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { teamId, date } = body

    if (!teamId || !date) {
      return NextResponse.json(
        { error: 'ID del equipo y fecha son requeridos' },
        { status: 400 }
      )
    }

    await TeamService.registerTeamAttendance(teamId, new Date(date))
    
    return NextResponse.json({ 
      success: true, 
      message: 'Asistencia del equipo registrada exitosamente' 
    })
  } catch (error) {
    console.error('Error registering team attendance:', error)
    return NextResponse.json(
      { error: 'Error al registrar asistencia del equipo' },
      { status: 500 }
    )
  }
} 