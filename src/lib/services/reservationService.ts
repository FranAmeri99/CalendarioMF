import { prisma } from '../prisma'
import type { Reservation, User, Team } from '@prisma/client'

export interface ReservationWithUser extends Reservation {
  user: User
  team: Team | null
}

export interface CreateReservationData {
  date: Date
  userId: string
  teamId?: string
}

export interface UpdateReservationData {
  date?: Date
  userId?: string
  teamId?: string
}

export class ReservationService {
  // Obtener todas las reservas con usuarios y equipos
  static async getAllReservations(): Promise<ReservationWithUser[]> {
    try {
      console.log('🔄 Obteniendo reservas...')
      console.log('🔄 Prisma client:', prisma)
      
      const reservations = await prisma.reservation.findMany({
        include: {
          user: true,
          team: true,
        },
        orderBy: {
          date: 'desc',
        },
      })
      
      console.log(`✅ Reservas obtenidas: ${reservations.length}`)
      console.log('✅ Reservas:', reservations)
      
      return reservations
    } catch (error) {
      console.error('❌ Error fetching reservations:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      })
      throw new Error(`Error al obtener reservas: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  // Obtener reservas por fecha
  static async getReservationsByDate(date: Date): Promise<ReservationWithUser[]> {
    try {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const reservations = await prisma.reservation.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          user: true,
          team: true,
        },
        orderBy: {
          date: 'asc',
        },
      })
      return reservations
    } catch (error) {
      console.error('Error fetching reservations by date:', error)
      throw new Error('Error al obtener reservas por fecha')
    }
  }

  // Obtener reservas por usuario
  static async getReservationsByUser(userId: string): Promise<ReservationWithUser[]> {
    try {
      const reservations = await prisma.reservation.findMany({
        where: { userId },
        include: {
          user: true,
          team: true,
        },
        orderBy: {
          date: 'desc',
        },
      })
      return reservations
    } catch (error) {
      console.error('Error fetching reservations by user:', error)
      throw new Error('Error al obtener reservas del usuario')
    }
  }

  // Obtener reservas por equipo
  static async getReservationsByTeam(teamId: string): Promise<ReservationWithUser[]> {
    try {
      const reservations = await prisma.reservation.findMany({
        where: { teamId },
        include: {
          user: true,
          team: true,
        },
        orderBy: {
          date: 'desc',
        },
      })
      return reservations
    } catch (error) {
      console.error('Error fetching reservations by team:', error)
      throw new Error('Error al obtener reservas del equipo')
    }
  }

  // Crear nueva reserva
  static async createReservation(data: CreateReservationData): Promise<ReservationWithUser> {
    try {
      // Verificar si ya existe una reserva para el usuario en esa fecha
      const startOfDay = new Date(data.date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(data.date)
      endOfDay.setHours(23, 59, 59, 999)
      
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          userId: data.userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      })

      if (existingReservation) {
        throw new Error('Ya existe una reserva para este usuario en esta fecha')
      }

      const reservation = await prisma.reservation.create({
        data,
        include: {
          user: true,
          team: true,
        },
      })
      
      return reservation
    } catch (error) {
      console.error('Error creating reservation:', error)
      throw error
    }
  }

  // Actualizar reserva
  static async updateReservation(id: string, data: UpdateReservationData): Promise<ReservationWithUser> {
    try {
      const reservation = await prisma.reservation.update({
        where: { id },
        data,
        include: {
          user: true,
          team: true,
        },
      })
      return reservation
    } catch (error) {
      console.error('Error updating reservation:', error)
      throw new Error('Error al actualizar reserva')
    }
  }

  // Eliminar reserva
  static async deleteReservation(id: string): Promise<void> {
    try {
      await prisma.reservation.delete({
        where: { id },
      })
    } catch (error) {
      console.error('Error deleting reservation:', error)
      throw new Error('Error al eliminar reserva')
    }
  }

  // Obtener estadísticas de reservas
  static async getReservationStats() {
    try {
      const totalReservations = await prisma.reservation.count()
      
      const today = new Date()
      const startOfToday = new Date(today)
      startOfToday.setHours(0, 0, 0, 0)
      
      const todayReservations = await prisma.reservation.count({
        where: {
          date: {
            gte: startOfToday,
          },
        },
      })

      const thisWeekReservations = await prisma.reservation.count({
        where: {
          date: {
            gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      })

      return {
        totalReservations,
        todayReservations,
        thisWeekReservations,
      }
    } catch (error) {
      console.error('Error fetching reservation stats:', error)
      throw new Error('Error al obtener estadísticas de reservas')
    }
  }

  // Verificar disponibilidad para una fecha
  static async checkAvailability(date: Date): Promise<{ available: boolean; reservedCount: number; maxSpots: number }> {
    try {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const reservedCount = await prisma.reservation.count({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      })

      // Obtener configuración dinámica
      const { ConfigService } = await import('./configService')
      const maxSpots = await ConfigService.getMaxSpotsPerDay()
      const available = reservedCount < maxSpots

      return {
        available,
        reservedCount,
        maxSpots,
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      throw new Error('Error al verificar disponibilidad')
    }
  }
} 