import { User, Team, Reservation } from '@prisma/client'

export type UserWithTeam = User & {
  team: Team | null
}

export type ReservationWithUser = Reservation & {
  user: User
}

export type ReservationWithUserAndTeam = Reservation & {
  user: User
  team: Team | null
}

export type TeamWithMembers = Team & {
  members: User[]
  leader: User | null
}

export interface DashboardStats {
  totalUsers: number
  totalTeams: number
  totalReservations: number
  availableSpots: number
  reservedSpots: number
}

export interface CalendarDay {
  date: Date
  reservations: ReservationWithUser[]
  availableSpots: number
  isFull: boolean
}

export interface ReservationFormData {
  date: string
  userId: string
  teamId?: string
}

export interface UserFormData {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
  teamId?: string
}

export interface TeamFormData {
  name: string
  description?: string
  leaderId?: string
} 