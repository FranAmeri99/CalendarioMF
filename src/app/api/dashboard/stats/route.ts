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

    const maxSpots = 12 // Forzar a 12 para corregir el problema
    const today = dayjs().startOf('day')
    
    console.log('🔍 All reservations count:', reservations.length)

    const todayReservations = (reservations as any[]).filter(r => {
      const reservationDate = dayjs(r.date).startOf('day')
      const isToday = reservationDate.isSame(today, 'day')
      console.log(`Reservation ${r.id}: ${r.date} -> ${reservationDate.format('YYYY-MM-DD')} isToday: ${isToday}`)
      return isToday
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
    console.log('Today date:', today.format('YYYY-MM-DD'))
    
    // Verificar si hay reservas duplicadas
    const todayReservationIds = todayReservations.map(r => r.id)
    const uniqueIds = new Set(todayReservationIds)
    console.log('Today reservation IDs:', todayReservationIds)
    console.log('Unique IDs count:', uniqueIds.size)
    console.log('Has duplicates:', todayReservationIds.length !== uniqueIds.size)

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