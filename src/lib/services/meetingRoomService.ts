import { prisma } from '../prisma'
import type { MeetingRoom, MeetingRoomBooking, User } from '@prisma/client'

export interface MeetingRoomWithBookings extends MeetingRoom {
  bookings: MeetingRoomBooking[]
}

export interface MeetingRoomBookingWithUser extends MeetingRoomBooking {
  user: User
  meetingRoom: MeetingRoom
}

export interface CreateMeetingRoomData {
  name: string
  description?: string
  capacity?: number
  isActive?: boolean
}

export interface UpdateMeetingRoomData {
  name?: string
  description?: string
  capacity?: number
  isActive?: boolean
}

export interface CreateBookingData {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  userId: string
  meetingRoomId: string
}

export interface UpdateBookingData {
  title?: string
  description?: string
  startTime?: Date
  endTime?: Date
  userId?: string
  meetingRoomId?: string
}

export class MeetingRoomService {
  // Obtener todas las salas de reuniones
  static async getAllMeetingRooms(): Promise<MeetingRoom[]> {
    try {
      const meetingRooms = await prisma.meetingRoom.findMany({
        orderBy: {
          name: 'asc',
        },
      })
      return meetingRooms
    } catch (error) {
      console.error('Error fetching meeting rooms:', error)
      throw new Error('Error al obtener salas de reuniones')
    }
  }

  // Obtener sala de reuniones por ID
  static async getMeetingRoomById(id: string): Promise<MeetingRoomWithBookings | null> {
    try {
      const meetingRoom = await prisma.meetingRoom.findUnique({
        where: { id },
        include: {
          bookings: {
            include: {
              user: true,
            },
            orderBy: {
              startTime: 'asc',
            },
          },
        },
      })
      return meetingRoom
    } catch (error) {
      console.error('Error fetching meeting room:', error)
      throw new Error('Error al obtener sala de reuniones')
    }
  }

  // Crear nueva sala de reuniones
  static async createMeetingRoom(data: CreateMeetingRoomData): Promise<MeetingRoom> {
    try {
      const meetingRoom = await prisma.meetingRoom.create({
        data,
      })
      return meetingRoom
    } catch (error) {
      console.error('Error creating meeting room:', error)
      throw new Error('Error al crear sala de reuniones')
    }
  }

  // Actualizar sala de reuniones
  static async updateMeetingRoom(id: string, data: UpdateMeetingRoomData): Promise<MeetingRoom> {
    try {
      const meetingRoom = await prisma.meetingRoom.update({
        where: { id },
        data,
      })
      return meetingRoom
    } catch (error) {
      console.error('Error updating meeting room:', error)
      throw new Error('Error al actualizar sala de reuniones')
    }
  }

  // Eliminar sala de reuniones
  static async deleteMeetingRoom(id: string): Promise<void> {
    try {
      await prisma.meetingRoom.delete({
        where: { id },
      })
    } catch (error) {
      console.error('Error deleting meeting room:', error)
      throw new Error('Error al eliminar sala de reuniones')
    }
  }

  // Obtener todas las reservas de salas de reuniones
  static async getAllBookings(): Promise<MeetingRoomBookingWithUser[]> {
    try {
      const bookings = await prisma.meetingRoomBooking.findMany({
        include: {
          user: true,
          meetingRoom: true,
        },
        orderBy: {
          startTime: 'desc',
        },
      })
      return bookings
    } catch (error) {
      console.error('Error fetching bookings:', error)
      throw new Error('Error al obtener reservas de salas de reuniones')
    }
  }

  // Obtener reservas por usuario
  static async getBookingsByUser(userId: string): Promise<MeetingRoomBookingWithUser[]> {
    try {
      const bookings = await prisma.meetingRoomBooking.findMany({
        where: { userId },
        include: {
          user: true,
          meetingRoom: true,
        },
        orderBy: {
          startTime: 'desc',
        },
      })
      return bookings
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      throw new Error('Error al obtener reservas del usuario')
    }
  }

  // Obtener reservas por sala de reuniones
  static async getBookingsByMeetingRoom(meetingRoomId: string): Promise<MeetingRoomBookingWithUser[]> {
    try {
      const bookings = await prisma.meetingRoomBooking.findMany({
        where: { meetingRoomId },
        include: {
          user: true,
          meetingRoom: true,
        },
        orderBy: {
          startTime: 'asc',
        },
      })
      return bookings
    } catch (error) {
      console.error('Error fetching meeting room bookings:', error)
      throw new Error('Error al obtener reservas de la sala de reuniones')
    }
  }

  // Crear nueva reserva
  static async createBooking(data: CreateBookingData): Promise<MeetingRoomBookingWithUser> {
    try {
      // Verificar si hay conflictos de horario
      const conflictingBooking = await prisma.meetingRoomBooking.findFirst({
        where: {
          meetingRoomId: data.meetingRoomId,
          OR: [
            {
              startTime: {
                lt: data.endTime,
                gte: data.startTime,
              },
            },
            {
              endTime: {
                gt: data.startTime,
                lte: data.endTime,
              },
            },
            {
              startTime: {
                lte: data.startTime,
              },
              endTime: {
                gte: data.endTime,
              },
            },
          ],
        },
      })

      if (conflictingBooking) {
        throw new Error('Ya existe una reserva para este horario en esta sala')
      }

      const booking = await prisma.meetingRoomBooking.create({
        data,
        include: {
          user: true,
          meetingRoom: true,
        },
      })
      return booking
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    }
  }

  // Actualizar reserva
  static async updateBooking(id: string, data: UpdateBookingData): Promise<MeetingRoomBookingWithUser> {
    try {
      const booking = await prisma.meetingRoomBooking.update({
        where: { id },
        data,
        include: {
          user: true,
          meetingRoom: true,
        },
      })
      return booking
    } catch (error) {
      console.error('Error updating booking:', error)
      throw new Error('Error al actualizar reserva')
    }
  }

  // Eliminar reserva
  static async deleteBooking(id: string): Promise<void> {
    try {
      await prisma.meetingRoomBooking.delete({
        where: { id },
      })
    } catch (error) {
      console.error('Error deleting booking:', error)
      throw new Error('Error al eliminar reserva')
    }
  }

  // Verificar disponibilidad de una sala para un horario específico
  static async checkAvailability(
    meetingRoomId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ): Promise<{ available: boolean; conflictingBookings: MeetingRoomBookingWithUser[] }> {
    try {
      const conflictingBookings = await prisma.meetingRoomBooking.findMany({
        where: {
          meetingRoomId,
          id: {
            not: excludeBookingId,
          },
          OR: [
            {
              startTime: {
                lt: endTime,
                gte: startTime,
              },
            },
            {
              endTime: {
                gt: startTime,
                lte: endTime,
              },
            },
            {
              startTime: {
                lte: startTime,
              },
              endTime: {
                gte: endTime,
              },
            },
          ],
        },
        include: {
          user: true,
          meetingRoom: true,
        },
      })

      return {
        available: conflictingBookings.length === 0,
        conflictingBookings,
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      throw new Error('Error al verificar disponibilidad')
    }
  }
} 