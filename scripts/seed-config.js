const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedConfig() {
  try {
    console.log('🌱 Sembrando configuración del sistema...')

    // Verificar si ya existe configuración
    const existingConfig = await prisma.systemConfig.findFirst()
    
    if (existingConfig) {
      console.log('✅ Configuración ya existe en la base de datos:')
      console.log('   - Máximo de personas por día:', existingConfig.maxSpotsPerDay)
      console.log('   - Reservas en fin de semana:', existingConfig.allowWeekendReservations ? 'Permitidas' : 'Bloqueadas')
      console.log('   - Reservas en festivos:', existingConfig.allowHolidayReservations ? 'Permitidas' : 'Bloqueadas')
      console.log('   - Días máximos de anticipación:', existingConfig.maxAdvanceBookingDays)
      console.log('   - Horas mínimas de anticipación:', existingConfig.minAdvanceBookingHours)
      console.log('   - Cancelación automática:', existingConfig.autoCancelInactiveReservations ? 'Activa' : 'Inactiva')
      console.log('   - Horas de inactividad:', existingConfig.inactiveReservationHours)
      return
    }

    // Crear configuración por defecto
    const config = await prisma.systemConfig.create({
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

    console.log('✅ Configuración creada exitosamente:')
    console.log('   - ID:', config.id)
    console.log('   - Nombre:', config.name)
    console.log('   - Máximo de personas por día:', config.maxSpotsPerDay)
    console.log('   - Reservas en fin de semana:', config.allowWeekendReservations ? 'Permitidas' : 'Bloqueadas')
    console.log('   - Reservas en festivos:', config.allowHolidayReservations ? 'Permitidas' : 'Bloqueadas')
    console.log('   - Días máximos de anticipación:', config.maxAdvanceBookingDays)
    console.log('   - Horas mínimas de anticipación:', config.minAdvanceBookingHours)
    console.log('   - Cancelación automática:', config.autoCancelInactiveReservations ? 'Activa' : 'Inactiva')
    console.log('   - Horas de inactividad:', config.inactiveReservationHours)
    console.log('   - Creado:', config.createdAt)
    console.log('   - Actualizado:', config.updatedAt)

  } catch (error) {
    console.error('❌ Error sembrando configuración:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedConfig()
    .then(() => {
      console.log('🎉 Sembrado completado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Error en el sembrado:', error)
      process.exit(1)
    })
}

module.exports = { seedConfig } 