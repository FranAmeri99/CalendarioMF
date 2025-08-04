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
    console.log('🔍 POST /api/reservations iniciado')
    
    const body = await request.json()
    console.log('🔍 Body recibido:', body)
    
    const { date, userId, teamId } = body

    if (!date || !userId) {
      console.log('❌ Faltan campos requeridos')
      return NextResponse.json(
        { error: 'Fecha y usuario son requeridos' },
        { status: 400 }
      )
    }

    console.log('🔍 Validación pasada, procesando fecha...')

    // Convertir la fecha a formato completo con hora 12:00:00 UTC
    let reservationDate: Date
    if (typeof date === 'string' && date.includes('T')) {
      // Si ya es una fecha completa, usarla tal como está
      reservationDate = new Date(date)
    } else {
      // Si es solo una fecha (YYYY-MM-DD), crear fecha en UTC
      const [year, month, day] = date.split('-').map(Number)
      // Crear fecha en UTC para evitar problemas de zona horaria
      reservationDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0)) // 12:00 UTC
      
      console.log('🔍 API - Procesando fecha:')
      console.log(`  - Fecha recibida: ${date}`)
      console.log(`  - Año: ${year}, Mes: ${month}, Día: ${day}`)
      console.log(`  - Fecha creada: ${reservationDate.toISOString()}`)
      console.log(`  - Fecha local: ${reservationDate.toString()}`)
    }

    console.log('🔍 Creando reserva:')
    console.log(`  - Fecha recibida: ${date}`)
    console.log(`  - Fecha procesada: ${reservationDate.toISOString()}`)

    // Crear la reserva directamente con Prisma para evitar problemas con el servicio
    const { prisma } = await import('@/lib/prisma')
    
    const reservation = await prisma.reservation.create({
      data: {
        date: reservationDate,
        userId,
        teamId: teamId || null,
      },
      include: {
        user: true,
        team: true,
      },
    })

    console.log('✅ Reserva creada exitosamente')
    return NextResponse.json({ reservation })
  } catch (error) {
    console.error('❌ Error creating reservation:', error)
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

    // Convertir la fecha a formato completo con hora 12:00:00 UTC
    let reservationDate: Date
    if (typeof date === 'string' && date.includes('T')) {
      // Si ya es una fecha completa, usarla tal como está
      reservationDate = new Date(date)
    } else {
      // Si es solo una fecha (YYYY-MM-DD), crear fecha en UTC
      const [year, month, day] = date.split('-').map(Number)
      // Crear fecha en UTC para evitar problemas de zona horaria
      reservationDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0)) // 12:00 UTC
    }

    console.log('🔍 Actualizando reserva:')
    console.log(`  - Fecha recibida: ${date}`)
    console.log(`  - Fecha procesada: ${reservationDate.toISOString()}`)

    const reservation = await ReservationService.updateReservation(id, {
      date: reservationDate,
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

    console.log('🔍 Eliminando reserva:')
    console.log(`  - ID de reserva: ${id}`)

    if (!id) {
      return NextResponse.json(
        { error: 'ID de reserva es requerido' },
        { status: 400 }
      )
    }

    await ReservationService.deleteReservation(id)
    console.log(`✅ Reserva eliminada exitosamente: ${id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la reserva' },
      { status: 500 }
    )
  }
} 