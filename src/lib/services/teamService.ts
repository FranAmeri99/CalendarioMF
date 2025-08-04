import { prisma } from './prisma'
import type { Team, User } from '@prisma/client'

export interface TeamWithMembers extends Team {
  members: User[]
  leader: User | null
}

export interface CreateTeamData {
  name: string
  description?: string
  leaderId?: string
}

export interface UpdateTeamData {
  name?: string
  description?: string
  leaderId?: string
}

export class TeamService {
  // Obtener todos los equipos con miembros
  static async getAllTeams(): Promise<TeamWithMembers[]> {
    try {
      const teams = await prisma.team.findMany({
        include: {
          members: true,
          leader: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return teams
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
          members: true,
          leader: true,
        },
      })
      return team
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
          members: true,
          leader: true,
        },
      })
      return team
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
          members: true,
          leader: true,
        },
      })
      return team
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

  // Asignar usuario a equipo
  static async assignUserToTeam(userId: string, teamId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { teamId },
      })
    } catch (error) {
      console.error('Error assigning user to team:', error)
      throw new Error('Error al asignar usuario al equipo')
    }
  }

  // Remover usuario de equipo
  static async removeUserFromTeam(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { teamId: null },
      })
    } catch (error) {
      console.error('Error removing user from team:', error)
      throw new Error('Error al remover usuario del equipo')
    }
  }
} 