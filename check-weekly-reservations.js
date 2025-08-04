const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkWeeklyReservations() {
  try {
    console.log('🔍 Verificando reservas de esta semana...')
    
    const reservations = await prisma.reservation.findMany({
      include: {
        user: true
      },
      orderBy: {
        date: 'asc'
      }
    })

    console.log(`📊 Total de reservas: ${reservations.length}`)
    
    // Definir los días de la semana (lunes a domingo)
    const weekDays = [
      { name: 'Lunes', date: '2025-08-04' },
      { name: 'Martes', date: '2025-08-05' },
      { name: 'Miércoles', date: '2025-08-06' },
      { name: 'Jueves', date: '2025-08-07' },
      { name: 'Viernes', date: '2025-08-08' },
      { name: 'Sábado', date: '2025-08-09' },
      { name: 'Domingo', date: '2025-08-10' }
    ]
    
    console.log('\n📅 Reservas por día de esta semana:')
    console.log('=====================================')
    
    weekDays.forEach(day => {
      const dayReservations = reservations.filter(r => {
        const reservationDate = new Date(r.date).toISOString().split('T')[0]
        return reservationDate === day.date
      })
      
      console.log(`\n${day.name} (${day.date}):`)
      console.log(`  Reservas: ${dayReservations.length}/12`)
      console.log(`  Porcentaje: ${Math.round((dayReservations.length / 12) * 100)}%`)
      
      if (dayReservations.length > 0) {
        dayReservations.forEach((reservation, index) => {
          console.log(`    ${index + 1}. ${reservation.user.name} - ${reservation.date}`)
        })
      } else {
        console.log('    Sin reservas')
      }
    })
    
    // Mostrar todas las reservas para referencia
    console.log('\n📋 Todas las reservas:')
    console.log('======================')
    reservations.forEach((reservation, index) => {
      const date = new Date(reservation.date).toISOString().split('T')[0]
      console.log(`${index + 1}. ${reservation.user.name} - ${date} (${reservation.date})`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkWeeklyReservations() 