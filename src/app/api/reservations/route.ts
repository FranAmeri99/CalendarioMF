import { NextRequest, NextResponse } from 'next/server'
import { ReservationService } from '@/lib/services/reservationService'
import { UserService } from '@/lib/services/userService'
import { TeamService } from '@/lib/services/teamService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Si se proporciona userId, obtener reservas del usuario
    if (userId) {
      const reservations = await ReservationService.getReservationsByUser(userId)
      return NextResponse.json(reservations)
    }

    // Si no se proporciona userId, obtener todas las reservas
    const [reservations, users, teams] = await Promise.all([
      ReservationService.getAllReservations(),
      UserService.getAllUsers(),
      TeamService.getSimpleTeams(),
    ])

    return NextResponse.json({ reservations, users, teams })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: 'Error al obtener reservas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, userId, teamId } = body

    if (!date || !userId) {
      return NextResponse.json(
        { error: 'Fecha y usuario son requeridos' },
        { status: 400 }
      )
    }

    const reservation = await ReservationService.createReservation({
      date: new Date(date),
      userId,
      teamId: teamId || undefined,
    })

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { error: 'Error al crear la reserva' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, date, userId, teamId } = body

    if (!id || !date || !userId) {
      return NextResponse.json(
        { error: 'ID, fecha y usuario son requeridos' },
        { status: 400 }
      )
    }

    const reservation = await ReservationService.updateReservation(id, {
      date: new Date(date),
      userId,
      teamId: teamId || undefined,
    })

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la reserva' },
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
        { error: 'ID de reserva es requerido' },
        { status: 400 }
      )
    }

    await ReservationService.deleteReservation(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la reserva' },
      { status: 500 }
    )
  }
} 