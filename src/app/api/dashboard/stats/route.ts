import { NextRequest, NextResponse } from 'next/server'
import { ReservationService, type ReservationWithUser } from '@/lib/services/reservationService'
import { UserService } from '@/lib/services/userService'
import { TeamService } from '@/lib/services/teamService'
import { ConfigService } from '@/lib/services/configService'
import dayjs from 'dayjs'

export async function GET() {
  try {
    const [reservations, userStats, teams, config] = await Promise.all([
      ReservationService.getAllReservations(),
      UserService.getUserStats(),
      TeamService.getSimpleTeams(),
      ConfigService.getConfig(),
    ])

    const maxSpots = config?.maxSpotsPerDay || 12
    const today = dayjs().startOf('day')
    
    const todayReservations = (reservations as ReservationWithUser[]).filter(r => {
      const reservationDate = dayjs(r.date).startOf('day')
      return reservationDate.isSame(today, 'day')
    })

    const reservedSpots = todayReservations.length
    const availableSpots = maxSpots - reservedSpots

    const stats = {
      totalUsers: userStats.totalUsers,
      totalTeams: teams.length,
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