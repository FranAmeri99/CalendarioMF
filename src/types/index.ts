// Tipos para la aplicación de gestión de asistencia

export interface User {
  id: string
  email: string
  name: string
  role: string
  teamId?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Team {
  id: string
  name: string
  description?: string
  leaderId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Reservation {
  id: string
  date: Date
  userId: string
  teamId?: string
  createdAt: Date
  updatedAt: Date
}

export type UserWithTeam = User & {
  team: Team | null
}

export type ReservationWithUser = Reservation & {
  user: User
  team: Team | null
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