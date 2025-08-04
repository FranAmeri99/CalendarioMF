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
      TeamService.getSimpleTeams(),
      ConfigService.getConfig(),
    ])

    const maxSpots = config?.maxSpotsPerDay || 12
    const today = dayjs().tz('America/Argentina/Buenos_Aires').startOf('day')
    
    console.log('🔍 All reservations count:', reservations.length)
    console.log('🔍 Current date (local):', dayjs().format('YYYY-MM-DD'))
    console.log('🔍 Current date (Argentina):', today.format('YYYY-MM-DD'))

    const todayReservations = (reservations as any[]).filter(r => {
      const reservationDate = dayjs(r.date).tz('America/Argentina/Buenos_Aires').startOf('day')
      const isToday = reservationDate.isSame(today, 'day')
      console.log(`Reservation ${r.id}: ${r.date} -> ${reservationDate.format('YYYY-MM-DD')} isToday: ${isToday}`)
      console.log(`  - Original date: ${r.date}`)
      console.log(`  - Argentina date: ${reservationDate.format('YYYY-MM-DD HH:mm:ss')}`)
      console.log(`  - Today: ${today.format('YYYY-MM-DD HH:mm:ss')}`)
      console.log(`  - Is same day: ${isToday}`)
      return isToday
    })

    const reservedSpots = todayReservations.length
    const availableSpots = maxSpots - reservedSpots

    // Calcular promedio semanal de ocupación
    const weekStart = dayjs().tz('America/Argentina/Buenos_Aires').startOf('week')
    const weekEnd = dayjs().tz('America/Argentina/Buenos_Aires').endOf('week')
    
    const weeklyReservations = (reservations as any[]).filter(r => {
      const reservationDate = dayjs(r.date).tz('America/Argentina/Buenos_Aires')
      return reservationDate.isSameOrAfter(weekStart, 'day') && reservationDate.isSameOrBefore(weekEnd, 'day')
    })

    const totalWeeklySpots = maxSpots * 7 // 7 días de la semana
    const totalWeeklyReservations = weeklyReservations.length
    const weeklyAverage = totalWeeklySpots > 0 ? Math.round((totalWeeklyReservations / totalWeeklySpots) * 100) : 0

    console.log('📊 Dashboard Stats Debug:')
    console.log('Config maxSpotsPerDay:', config?.maxSpotsPerDay)
    console.log('Using maxSpots:', maxSpots)
    console.log('Total reservations:', reservations.length)
    console.log('Today reservations:', todayReservations.length)
    console.log('Weekly reservations:', weeklyReservations.length)
    console.log('Weekly average:', weeklyAverage)
    console.log('Today date:', today.format('YYYY-MM-DD'))
    console.log('Week start:', weekStart.format('YYYY-MM-DD'))
    console.log('Week end:', weekEnd.format('YYYY-MM-DD'))
    
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