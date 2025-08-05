import { NextRequest, NextResponse } from 'next/server'
import { ReservationService, type ReservationWithUser } from '@/lib/services/reservationService'
import { UserService } from '@/lib/services/userService'
import { TeamService } from '@/lib/services/teamService'
import { ConfigService } from '@/lib/services/configService'

// Forzar revalidación dinámica
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const [reservations, users, teams, config] = await Promise.all([
      ReservationService.getAllReservations(),
      UserService.getAllUsers(),
      TeamService.getSimpleTeams(),
      ConfigService.getConfig(),
    ])

    // Asegurar que todas las reservas tengan el campo status
    const reservationsWithStatus = reservations.map((reservation: any) => ({
      ...reservation,
      status: reservation.status || 'confirmed'
    }))

    const response = NextResponse.json({ 
      reservations: reservationsWithStatus, 
      users, 
      teams,
      config,
      timestamp: Date.now() // Agregar timestamp para evitar caché
    })

    // Agregar headers para evitar caché
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos del calendario' },
      { status: 500 }
    )
  }
} 