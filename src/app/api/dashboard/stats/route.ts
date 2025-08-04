import { NextRequest, NextResponse } from 'next/server'
import { ReservationService, type ReservationWithUser } from '@/lib/services/reservationService'
import { UserService } from '@/lib/services/userService'
import { TeamService } from '@/lib/services/teamService'
import { ConfigService } from '@/lib/services/configService'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

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
    
    const todayReservations = (reservations as any[]).filter(r => {
      const reservationDate = dayjs(r.date).startOf('day')
      return reservationDate.isSame(today, 'day')
    })

    const reservedSpots = todayReservations.length
    const availableSpots = maxSpots - reservedSpots

    // Calcular promedio semanal de ocupación
    const weekStart = dayjs().startOf('week')
    const weekEnd = dayjs().endOf('week')
    
    const weeklyReservations = (reservations as any[]).filter(r => {
      const reservationDate = dayjs(r.date)
      return reservationDate.isSameOrAfter(weekStart, 'day') && reservationDate.isSameOrBefore(weekEnd, 'day')
    })

    const totalWeeklySpots = maxSpots * 7 // 7 días de la semana
    const totalWeeklyReservations = weeklyReservations.length
    const weeklyAverage = totalWeeklySpots > 0 ? Math.round((totalWeeklyReservations / totalWeeklySpots) * 100) : 0

    console.log('📊 Dashboard Stats Debug:')
    console.log('Total reservations:', reservations.length)
    console.log('Today reservations:', todayReservations.length)
    console.log('Weekly reservations:', weeklyReservations.length)
    console.log('Max spots per day:', maxSpots)
    console.log('Weekly average:', weeklyAverage)

    const stats = {
      totalUsers: userStats.totalUsers,
      totalTeams: teams.length,
      totalReservations: reservations.length,
      availableSpots,
      reservedSpots,
      maxSpots,
      weeklyAverage,
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