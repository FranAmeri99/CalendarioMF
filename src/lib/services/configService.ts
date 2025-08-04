import { prisma } from '../prisma'

export interface SystemConfig {
  id: string
  name: string
  maxSpotsPerDay: number
  allowWeekendReservations: boolean
  allowHolidayReservations: boolean
  maxAdvanceBookingDays: number
  minAdvanceBookingHours: number
  autoCancelInactiveReservations: boolean
  inactiveReservationHours: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateConfigData {
  name: string
  maxSpotsPerDay: number
  allowWeekendReservations?: boolean
  allowHolidayReservations?: boolean
  maxAdvanceBookingDays?: number
  minAdvanceBookingHours?: number
  autoCancelInactiveReservations?: boolean
  inactiveReservationHours?: number
}

export interface UpdateConfigData {
  name?: string
  maxSpotsPerDay?: number
  allowWeekendReservations?: boolean
  allowHolidayReservations?: boolean
  maxAdvanceBookingDays?: number
  minAdvanceBookingHours?: number
  autoCancelInactiveReservations?: boolean
  inactiveReservationHours?: number
}

export class ConfigService {
  // Obtener configuración actual
  static async getConfig(): Promise<SystemConfig> {
    try {
      const config = await prisma.systemConfig.findFirst()
      
      if (!config) {
        // Crear configuración por defecto si no existe
        return await this.createDefaultConfig()
      }
      
      return {
        id: config.id,
        name: config.name,
        maxSpotsPerDay: config.maxSpotsPerDay,
        allowWeekendReservations: config.allowWeekendReservations,
        allowHolidayReservations: config.allowHolidayReservations,
        maxAdvanceBookingDays: config.maxAdvanceBookingDays,
        minAdvanceBookingHours: config.minAdvanceBookingHours,
        autoCancelInactiveReservations: config.autoCancelInactiveReservations,
        inactiveReservationHours: config.inactiveReservationHours,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      }
    } catch (error) {
      console.error('Error fetching config:', error)
      throw new Error('Error al obtener configuración')
    }
  }

  // Crear configuración por defecto
  static async createDefaultConfig(): Promise<SystemConfig> {
    try {
      const defaultConfig = await prisma.systemConfig.create({
        data: {
          name: 'Configuración Principal',
          maxSpotsPerDay: 12,
          allowWeekendReservations: false,
          allowHolidayReservations: false,
          maxAdvanceBookingDays: 30,
          minAdvanceBookingHours: 2,
          autoCancelInactiveReservations: true,
          inactiveReservationHours: 24,
        },
      })
      
      return {
        id: defaultConfig.id,
        name: defaultConfig.name,
        maxSpotsPerDay: defaultConfig.maxSpotsPerDay,
        allowWeekendReservations: defaultConfig.allowWeekendReservations,
        allowHolidayReservations: defaultConfig.allowHolidayReservations,
        maxAdvanceBookingDays: defaultConfig.maxAdvanceBookingDays,
        minAdvanceBookingHours: defaultConfig.minAdvanceBookingHours,
        autoCancelInactiveReservations: defaultConfig.autoCancelInactiveReservations,
        inactiveReservationHours: defaultConfig.inactiveReservationHours,
        createdAt: defaultConfig.createdAt,
        updatedAt: defaultConfig.updatedAt,
      }
    } catch (error) {
      console.error('Error creating default config:', error)
      throw new Error('Error al crear configuración por defecto')
    }
  }

  // Actualizar configuración
  static async updateConfig(data: UpdateConfigData): Promise<SystemConfig> {
    try {
      let currentConfig = await prisma.systemConfig.findFirst()
      
      // Si no existe configuración, crear una por defecto
      if (!currentConfig) {
        currentConfig = await prisma.systemConfig.create({
          data: {
            maxSpotsPerDay: 12,
            allowWeekendReservations: false,
            allowHolidayReservations: false,
            maxAdvanceBookingDays: 30,
            minAdvanceBookingHours: 2,
            autoCancelInactiveReservations: true,
            inactiveReservationHours: 24,
          },
        })
      }
      
      const updatedConfig = await prisma.systemConfig.update({
        where: { id: currentConfig.id },
        data,
      })
      
      return {
        maxSpotsPerDay: updatedConfig.maxSpotsPerDay,
        allowWeekendReservations: updatedConfig.allowWeekendReservations,
        allowHolidayReservations: updatedConfig.allowHolidayReservations,
        maxAdvanceBookingDays: updatedConfig.maxAdvanceBookingDays,
        minAdvanceBookingHours: updatedConfig.minAdvanceBookingHours,
        autoCancelInactiveReservations: updatedConfig.autoCancelInactiveReservations,
        inactiveReservationHours: updatedConfig.inactiveReservationHours,
      }
    } catch (error) {
      console.error('Error updating config:', error)
      throw new Error('Error al actualizar configuración')
    }
  }

  // Obtener capacidad máxima por día
  static async getMaxSpotsPerDay(): Promise<number> {
    try {
      const config = await this.getConfig()
      return config.maxSpotsPerDay
    } catch (error) {
      console.error('Error getting max spots per day:', error)
      return 12 // Valor por defecto
    }
  }

  // Verificar si se permiten reservas en fin de semana
  static async isWeekendReservationsAllowed(): Promise<boolean> {
    try {
      const config = await this.getConfig()
      return config.allowWeekendReservations
    } catch (error) {
      console.error('Error checking weekend reservations:', error)
      return false
    }
  }

  // Verificar si se permiten reservas en días festivos
  static async isHolidayReservationsAllowed(): Promise<boolean> {
    try {
      const config = await this.getConfig()
      return config.allowHolidayReservations
    } catch (error) {
      console.error('Error checking holiday reservations:', error)
      return false
    }
  }

  // Obtener días máximos de anticipación para reservas
  static async getMaxAdvanceBookingDays(): Promise<number> {
    try {
      const config = await this.getConfig()
      return config.maxAdvanceBookingDays
    } catch (error) {
      console.error('Error getting max advance booking days:', error)
      return 30
    }
  }

  // Obtener horas mínimas de anticipación para reservas
  static async getMinAdvanceBookingHours(): Promise<number> {
    try {
      const config = await this.getConfig()
      return config.minAdvanceBookingHours
    } catch (error) {
      console.error('Error getting min advance booking hours:', error)
      return 2
    }
  }

  // Verificar si se cancelan automáticamente las reservas inactivas
  static async isAutoCancelInactiveReservations(): Promise<boolean> {
    try {
      const config = await this.getConfig()
      return config.autoCancelInactiveReservations
    } catch (error) {
      console.error('Error checking auto cancel inactive reservations:', error)
      return true
    }
  }

  // Obtener horas de inactividad para cancelación automática
  static async getInactiveReservationHours(): Promise<number> {
    try {
      const config = await this.getConfig()
      return config.inactiveReservationHours
    } catch (error) {
      console.error('Error getting inactive reservation hours:', error)
      return 24
    }
  }
} 