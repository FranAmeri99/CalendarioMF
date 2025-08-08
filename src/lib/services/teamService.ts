import { prisma } from '../prisma'
import type { Team, User } from '@prisma/client'

export interface TeamWithMembers extends Team {
  members: User[]
  leader: User | null
  userTeams?: any[] // Para la nueva relación muchos a muchos
}

export interface CreateTeamData {
  name: string
  description?: string
  leaderId?: string
  attendanceDay?: number
}

export interface UpdateTeamData {
  name?: string
  description?: string
  leaderId?: string
  attendanceDay?: number
}

export class TeamService {
  // Obtener todos los equipos con miembros (usando la nueva relación muchos a muchos)
  static async getAllTeams(): Promise<TeamWithMembers[]> {
    try {
      const teams = await prisma.team.findMany({
        include: {
          userTeams: {
            include: {
              user: true
            }
          },
          leader: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // Transformar los datos para mantener compatibilidad
      return teams.map(team => ({
        ...team,
        members: team.userTeams?.map(ut => ut.user) || [],
        userTeams: undefined // No exponer userTeams en la respuesta
      }))
    } catch (error) {
      console.error('Error fetching teams:', error)
      throw new Error('Error al obtener equipos')
    }
  }

  // Obtener equipo por ID
  static async getTeamById(id: string): Promise<TeamWithMembers | null> {
    try {
      const team = await prisma.team.findUnique({
        where: { id },
        include: {
          userTeams: {
            include: {
              user: true
            }
          },
          leader: true,
        },
      })

      if (!team) return null

      return {
        ...team,
        members: team.userTeams?.map(ut => ut.user) || [],
        userTeams: undefined
      }
    } catch (error) {
      console.error('Error fetching team by ID:', error)
      throw new Error('Error al obtener equipo')
    }
  }

  // Crear nuevo equipo
  static async createTeam(data: CreateTeamData): Promise<TeamWithMembers> {
    try {
      const team = await prisma.team.create({
        data,
        include: {
          userTeams: {
            include: {
              user: true
            }
          },
          leader: true,
        },
      })

      // Si hay un líder, asegurar que también sea miembro del equipo
      if (data.leaderId) {
        await prisma.userTeam.create({
          data: {
            userId: data.leaderId,
            teamId: team.id,
          },
        })
      }

      // Obtener el equipo actualizado con todos los miembros
      const updatedTeam = await prisma.team.findUnique({
        where: { id: team.id },
        include: {
          userTeams: {
            include: {
              user: true
            }
          },
          leader: true,
        },
      })

      if (!updatedTeam) {
        throw new Error('Error al crear equipo')
      }

      return {
        ...updatedTeam,
        members: updatedTeam.userTeams?.map(ut => ut.user) || [],
        userTeams: undefined
      }
    } catch (error) {
      console.error('Error creating team:', error)
      throw new Error('Error al crear equipo')
    }
  }

  // Actualizar equipo
  static async updateTeam(id: string, data: UpdateTeamData): Promise<TeamWithMembers> {
    try {
      const team = await prisma.team.update({
        where: { id },
        data,
        include: {
          userTeams: {
            include: {
              user: true
            }
          },
          leader: true,
        },
      })

      // Si se cambió el líder, asegurar que también sea miembro del equipo
      if (data.leaderId) {
        // Verificar si el líder ya es miembro
        const existingMembership = await prisma.userTeam.findUnique({
          where: {
            userId_teamId: {
              userId: data.leaderId,
              teamId: id,
            },
          },
        })

        if (!existingMembership) {
          await prisma.userTeam.create({
            data: {
              userId: data.leaderId,
              teamId: id,
            },
          })
        }
      }

      // Obtener el equipo actualizado con todos los miembros
      const updatedTeam = await prisma.team.findUnique({
        where: { id },
        include: {
          userTeams: {
            include: {
              user: true
            }
          },
          leader: true,
        },
      })

      if (!updatedTeam) {
        throw new Error('Error al actualizar equipo')
      }

      return {
        ...updatedTeam,
        members: updatedTeam.userTeams?.map(ut => ut.user) || [],
        userTeams: undefined
      }
    } catch (error) {
      console.error('Error updating team:', error)
      throw new Error('Error al actualizar equipo')
    }
  }

  // Eliminar equipo
  static async deleteTeam(id: string): Promise<void> {
    try {
      await prisma.team.delete({
        where: { id },
      })
    } catch (error) {
      console.error('Error deleting team:', error)
      throw new Error('Error al eliminar equipo')
    }
  }

  // Obtener equipos simples (sin miembros)
  static async getSimpleTeams(): Promise<Team[]> {
    try {
      const teams = await prisma.team.findMany({
        orderBy: {
          name: 'asc',
        },
      })
      return teams
    } catch (error) {
      console.error('Error fetching simple teams:', error)
      throw new Error('Error al obtener equipos')
    }
  }

  // Asignar usuario a equipo (nueva relación muchos a muchos)
  static async assignUserToTeam(userId: string, teamId: string): Promise<void> {
    try {
      await prisma.userTeam.create({
        data: {
          userId,
          teamId,
        },
      })
    } catch (error) {
      console.error('Error assigning user to team:', error)
      throw new Error('Error al asignar usuario al equipo')
    }
  }

  // Remover usuario de equipo (nueva relación muchos a muchos)
  static async removeUserFromTeam(userId: string, teamId: string): Promise<void> {
    try {
      await prisma.userTeam.delete({
        where: {
          userId_teamId: {
            userId,
            teamId,
          },
        },
      })
    } catch (error) {
      console.error('Error removing user from team:', error)
      throw new Error('Error al remover usuario del equipo')
    }
  }

  // Obtener todos los equipos de un usuario
  static async getUserTeams(userId: string): Promise<Team[]> {
    try {
      const userTeams = await prisma.userTeam.findMany({
        where: { userId },
        include: { team: true },
      })
      return userTeams.map(ut => ut.team)
    } catch (error) {
      console.error('Error fetching user teams:', error)
      throw new Error('Error al obtener equipos del usuario')
    }
  }

  // Obtener equipos por día de asistencia
  static async getTeamsByAttendanceDay(day: number): Promise<TeamWithMembers[]> {
    try {
      const teams = await prisma.team.findMany({
        where: { attendanceDay: day },
        include: {
          userTeams: {
            include: {
              user: true
            }
          },
          leader: true,
        },
        orderBy: {
          name: 'asc',
        },
      })

      return teams.map(team => ({
        ...team,
        members: team.userTeams?.map(ut => ut.user) || [],
        userTeams: undefined
      }))
    } catch (error) {
      console.error('Error fetching teams by attendance day:', error)
      throw new Error('Error al obtener equipos por día de asistencia')
    }
  }

  // Registrar asistencia masiva para un equipo en una fecha específica
  static async registerTeamAttendance(teamId: string, date: Date): Promise<void> {
    try {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          userTeams: {
            include: {
              user: true
            }
          }
        }
      })

      if (!team) {
        throw new Error('Equipo no encontrado')
      }

      const members = team.userTeams?.map(ut => ut.user) || []

      if (members.length === 0) {
        throw new Error('El equipo no tiene miembros')
      }

      // Crear reservas de asistencia para todos los miembros del equipo
      const reservations = members.map(member => ({
        date,
        userId: member.id,
        teamId: teamId
      }))

      await prisma.reservation.createMany({
        data: reservations,
        skipDuplicates: true // Evitar duplicados si ya existen
      })
    } catch (error) {
      console.error('Error registering team attendance:', error)
      throw new Error('Error al registrar asistencia del equipo')
    }
  }
} 