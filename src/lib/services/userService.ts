import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import type { User, Team } from '@prisma/client'

export interface UserWithTeam extends User {
  team?: Team | null
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
          team: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return users
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
          team: true,
        },
      })
      return user
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
          team: true,
        },
      })
      return user
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
          team: true,
        },
      })
      return user
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
          team: true,
        },
      })
      return user
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
          team: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return users
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
} 