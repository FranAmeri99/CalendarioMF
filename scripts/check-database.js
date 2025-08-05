const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Verificando datos en la base de datos...\n')
    
    // Verificar reservas de salas
    console.log('📅 RESERVAS DE SALAS:')
    const bookings = await prisma.meetingRoomBooking.findMany({
      include: {
        user: true,
        meetingRoom: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    })
    
    console.log(`Total de reservas: ${bookings.length}`)
    bookings.forEach((booking, index) => {
      console.log(`  ${index + 1}. ${booking.title}`)
      console.log(`     - Usuario: ${booking.user?.name || 'N/A'}`)
      console.log(`     - Sala: ${booking.meetingRoom?.name || 'N/A'}`)
      console.log(`     - Inicio: ${booking.startTime}`)
      console.log(`     - Fin: ${booking.endTime}`)
      console.log(`     - ID: ${booking.id}`)
      console.log('')
    })
    
    // Verificar reservas de asistencia
    console.log('👥 RESERVAS DE ASISTENCIA:')
    const reservations = await prisma.reservation.findMany({
      include: {
        user: true,
        team: true,
      },
      orderBy: {
        date: 'desc',
      },
    })
    
    console.log(`Total de reservas de asistencia: ${reservations.length}`)
    reservations.forEach((reservation, index) => {
      console.log(`  ${index + 1}. Fecha: ${reservation.date}`)
      console.log(`     - Usuario: ${reservation.user?.name || 'N/A'}`)
      console.log(`     - Equipo: ${reservation.team?.name || 'N/A'}`)
      console.log(`     - ID: ${reservation.id}`)
      console.log('')
    })
    
    // Verificar salas
    console.log('🏢 SALAS DE REUNIONES:')
    const rooms = await prisma.meetingRoom.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    
    console.log(`Total de salas: ${rooms.length}`)
    rooms.forEach((room, index) => {
      console.log(`  ${index + 1}. ${room.name}`)
      console.log(`     - Capacidad: ${room.capacity}`)
      console.log(`     - Activa: ${room.isActive ? 'Sí' : 'No'}`)
      console.log(`     - ID: ${room.id}`)
      console.log('')
    })
    
    // Verificar usuarios
    console.log('👤 USUARIOS:')
    const users = await prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    
    console.log(`Total de usuarios: ${users.length}`)
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email})`)
      console.log(`     - Rol: ${user.role}`)
      console.log(`     - ID: ${user.id}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  checkDatabase()
    .then(() => {
      console.log('🎉 Verificación completada')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Error:', error)
      process.exit(1)
    })
}

module.exports = { checkDatabase } 