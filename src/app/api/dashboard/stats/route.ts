import { NextRequest, NextResponse } from 'next/server'
import { ReservationService } from '@/lib/services/reservationService'
import { UserService } from '@/lib/services/userService'
import { TeamService } from '@/lib/services/teamService'
import { ConfigService } from '@/lib/services/configService'

export async function GET() {
  try {
    const [reservations, userStats, teams, config] = await Promise.all([
      ReservationService.getAllReservations(),
      UserService.getUserStats(),
      TeamService.getSimpleTeams(),
      ConfigService.getConfig(),
    ])

    const maxSpots = config?.maxSpotsPerDay || 12
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayReservations = reservations.filter(r => {
      const reservationDate = new Date(r.date)
      reservationDate.setHours(0, 0, 0, 0)
      return reservationDate.getTime() === today.getTime()
    })

    const reservedSpots = todayReservations.length
    const availableSpots = maxSpots - reservedSpots

    const stats = {
      totalUsers: userStats.totalUsers,
      totalTeams: userStats.totalTeams,
      totalReservations: reservations.length,
      availableSpots,
      reservedSpots,
      maxSpots,
    }

    return NextResponse.json({ stats, reservations, teams })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del dashboard' },
      { status: 500 }
    )
  }
} 