const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createMeetingRoom() {
  try {
    console.log('🏢 Creando nueva sala de reuniones...')
    
    const newMeetingRoom = await prisma.meetingRoom.create({
      data: {
        name: 'Sala de Reuniones Pequeña',
        description: 'Sala ideal para reuniones de equipo y sesiones de trabajo',
        capacity: 8,
        isActive: true,
      },
    })
    
    console.log('✅ Sala creada exitosamente:')
    console.log(`  - ID: ${newMeetingRoom.id}`)
    console.log(`  - Nombre: ${newMeetingRoom.name}`)
    console.log(`  - Capacidad: ${newMeetingRoom.capacity} personas`)
    console.log(`  - Activa: ${newMeetingRoom.isActive ? 'Sí' : 'No'}`)
    console.log(`  - Creada: ${newMeetingRoom.createdAt}`)
    
  } catch (error) {
    console.error('❌ Error al crear la sala:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  createMeetingRoom()
    .then(() => {
      console.log('🎉 Proceso completado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Error:', error)
      process.exit(1)
    })
}

module.exports = { createMeetingRoom } 