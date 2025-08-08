import { prisma } from '../prisma'
import bcrypt from 'bcryptjs'
import type { User, Team } from '@prisma/client'

export interface UserWithTeam extends User {
  team?: Team | null
  teams?: Team[] // Para la nueva relación muchos a muchos
}

export type { User, Team } from '@prisma/client'

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
  teamId?: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
  role?: 'ADMIN' | 'MANAGER' | 'USER'
  teamId?: string
}

export class UserService {
  // Obtener todos los usuarios con sus equipos
  static async getAllUsers(): Promise<UserWithTeam[]> {
    try {
      const users = await prisma.user.findMany({
        include: {
          team: true, // Mantener para compatibilidad
          userTeams: {
            include: {
              team: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // Transformar para incluir teams (nueva relación muchos a muchos)
      return users.map(user => ({
        ...user,
        teams: user.userTeams?.map(ut => ut.team) || [],
        userTeams: undefined // No exponer userTeams en la respuesta
      }))
    } catch (error) {
      console.error('Error fetching users:', error)
      throw new Error('Error al obtener usuarios')
    }
  }

  // Obtener usuario por ID
  static async getUserById(id: string): Promise<UserWithTeam | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          team: true, // Mantener para compatibilidad
          userTeams: {
            include: {
              team: true
            }
          }
        },
      })

      if (!user) return null

      return {
        ...user,
        teams: user.userTeams?.map(ut => ut.team) || [],
        userTeams: undefined
      }
    } catch (error) {
      console.error('Error fetching user by ID:', error)
      throw new Error('Error al obtener usuario')
    }
  }

  // Obtener usuario por email
  static async getUserByEmail(email: string): Promise<UserWithTeam | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          team: true, // Mantener para compatibilidad
          userTeams: {
            include: {
              team: {
                include: {
                  leader: true,
                  userTeams: {
                    include: {
                      user: true
                    }
                  }
                }
              }
            }
          }
        },
      })

      if (!user) return null

      // Obtener equipos donde el usuario es líder
      const teamsAsLeader = await prisma.team.findMany({
        where: { leaderId: user.id },
        include: {
          leader: true,
          userTeams: {
            include: {
              user: true
            }
          }
        },
      })

      // Transformar los equipos donde es miembro
      const teamsAsMember = user.userTeams?.map(ut => ({
        ...ut.team,
        members: ut.team.userTeams?.map(ut2 => ut2.user) || [],
        userTeams: undefined
      })) || []

      // Transformar los equipos donde es líder
      const teamsAsLeaderWithDetails = teamsAsLeader.map(team => ({
        ...team,
        members: team.userTeams?.map(ut => ut.user) || [],
        userTeams: undefined
      }))

      // Combinar ambos arrays y eliminar duplicados
      const allTeams = [...teamsAsMember, ...teamsAsLeaderWithDetails]
      const uniqueTeams = allTeams.filter((team, index, self) => 
        index === self.findIndex(t => t.id === team.id)
      )

      return {
        ...user,
        teams: uniqueTeams,
        userTeams: undefined
      }
    } catch (error) {
      console.error('Error fetching user by email:', error)
      throw new Error('Error al obtener usuario')
    }
  }

  // Crear nuevo usuario
  static async createUser(data: CreateUserData): Promise<UserWithTeam> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10)
      
      const user = await prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
        include: {
          team: true, // Mantener para compatibilidad
          userTeams: {
            include: {
              team: true
            }
          }
        },
      })

      return {
        ...user,
        teams: user.userTeams?.map(ut => ut.team) || [],
        userTeams: undefined
      }
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Error al crear usuario')
    }
  }

  // Actualizar usuario
  static async updateUser(id: string, data: UpdateUserData): Promise<UserWithTeam> {
    try {
      const updateData: any = { ...data }
      
      // Si se proporciona una nueva contraseña, hashearla
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10)
      }
      
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          team: true, // Mantener para compatibilidad
          userTeams: {
            include: {
              team: true
            }
          }
        },
      })

      return {
        ...user,
        teams: user.userTeams?.map(ut => ut.team) || [],
        userTeams: undefined
      }
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error('Error al actualizar usuario')
    }
  }

  // Eliminar usuario
  static async deleteUser(id: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id },
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      throw new Error('Error al eliminar usuario')
    }
  }

  // Buscar usuarios
  static async searchUsers(searchTerm: string): Promise<UserWithTeam[]> {
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { role: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          team: true, // Mantener para compatibilidad
          userTeams: {
            include: {
              team: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return users.map(user => ({
        ...user,
        teams: user.userTeams?.map(ut => ut.team) || [],
        userTeams: undefined
      }))
    } catch (error) {
      console.error('Error searching users:', error)
      throw new Error('Error al buscar usuarios')
    }
  }

  // Obtener estadísticas de usuarios
  static async getUserStats() {
    try {
      const totalUsers = await prisma.user.count()
      const adminUsers = await prisma.user.count({ where: { role: 'ADMIN' } })
      const managerUsers = await prisma.user.count({ where: { role: 'MANAGER' } })
      const regularUsers = await prisma.user.count({ where: { role: 'USER' } })
      
      return {
        totalUsers,
        adminUsers,
        managerUsers,
        regularUsers,
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      throw new Error('Error al obtener estadísticas de usuarios')
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

  // Agregar usuario a un equipo
  static async addUserToTeam(userId: string, teamId: string): Promise<void> {
    try {
      await prisma.userTeam.create({
        data: {
          userId,
          teamId,
        },
      })
    } catch (error) {
      console.error('Error adding user to team:', error)
      throw new Error('Error al agregar usuario al equipo')
    }
  }

  // Remover usuario de un equipo
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
} 