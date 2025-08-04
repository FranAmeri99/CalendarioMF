const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkReservations() {
  try {
    console.log('🔍 Verificando todas las reservas...')
    
    const reservations = await prisma.reservation.findMany({
      include: {
        user: true
      },
      orderBy: {
        date: 'asc'
      }
    })

    console.log(`📊 Total de reservas: ${reservations.length}`)
    
    reservations.forEach((reservation, index) => {
      console.log(`\n${index + 1}. Reserva ID: ${reservation.id}`)
      console.log(`   Usuario: ${reservation.user.name}`)
      console.log(`   Fecha: ${reservation.date}`)
      console.log(`   Fecha (ISO): ${reservation.date.toISOString()}`)
      
      // Convertir a zona horaria de Argentina
      const argentinaDate = new Date(reservation.date.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
      console.log(`   Fecha (Argentina): ${argentinaDate.toISOString().split('T')[0]}`)
    })

    // Verificar reservas para hoy (4 de agosto)
    const today = new Date('2025-08-04T00:00:00.000Z')
    const tomorrow = new Date('2025-08-05T00:00:00.000Z')
    
    const todayReservations = reservations.filter(r => 
      r.date >= today && r.date < tomorrow
    )
    
    console.log(`\n📅 Reservas para hoy (4 de agosto): ${todayReservations.length}`)
    todayReservations.forEach((reservation, index) => {
      console.log(`   ${index + 1}. ${reservation.user.name} - ${reservation.date}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkReservations() 