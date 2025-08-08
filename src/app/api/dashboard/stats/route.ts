import { NextRequest, NextResponse } from 'next/server'
import { ReservationService, type ReservationWithUser } from '@/lib/services/reservationService'
import { UserService } from '@/lib/services/userService'
import { TeamService } from '@/lib/services/teamService'
import { ConfigService } from '@/lib/services/configService'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(utc)
dayjs.extend(timezone)

export async function GET() {
  try {
    const [reservations, userStats, teams, config] = await Promise.all([
      ReservationService.getAllReservations(),
      UserService.getUserStats(),
      TeamService.getAllTeams(), // Cambiado de getSimpleTeams() a getAllTeams() para incluir miembros
      ConfigService.getConfig(),
    ])

    const maxSpots = config?.maxSpotsPerDay || 12
    const today = dayjs().tz('America/Argentina/Buenos_Aires').startOf('day')

    const todayReservations = (reservations as any[]).filter(r => {
      // Convertir la fecha de la reserva a UTC primero, luego a zona horaria de Argentina
      const reservationDate = dayjs.utc(r.date).tz('America/Argentina/Buenos_Aires').startOf('day')
      const isToday = reservationDate.isSame(today, 'day')
      
      return isToday
    })

    const reservedSpots = todayReservations.length
    const availableSpots = maxSpots - reservedSpots

    // Calcular promedio semanal de ocupación (solo días laborables: lunes a viernes)
    const weekStart = dayjs().tz('America/Argentina/Buenos_Aires').startOf('week')
    const weekEnd = dayjs().tz('America/Argentina/Buenos_Aires').endOf('week')
    
    const weeklyReservations = (reservations as any[]).filter(r => {
      const reservationDate = dayjs.utc(r.date).tz('America/Argentina/Buenos_Aires')
      // Solo incluir reservas de lunes a viernes (días 1-5, donde 0=domingo, 1=lunes, etc.)
      const dayOfWeek = reservationDate.day()
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5 // Lunes=1, Martes=2, ..., Viernes=5
      
      return reservationDate.isSameOrAfter(weekStart, 'day') && 
             reservationDate.isSameOrBefore(weekEnd, 'day') && 
             isWeekday
    })

    const totalWeeklySpots = maxSpots * 5 // 5 días laborables (lunes a viernes)
    const totalWeeklyReservations = weeklyReservations.length
    const weeklyAverage = totalWeeklySpots > 0 ? Math.round((totalWeeklyReservations / totalWeeklySpots) * 100) : 0

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