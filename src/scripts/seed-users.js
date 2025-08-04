const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedUsers() {
  try {
    console.log('🌱 Iniciando seed de usuarios...')

    // Crear equipos primero (o obtenerlos si ya existen)
    const teams = [
      {
        name: 'Desarrollo',
        description: 'Equipo de desarrollo',
        leaderId: null,
      },
      {
        name: 'Diseño',
        description: 'Equipo de diseño',
        leaderId: null,
      },
      {
        name: 'Marketing',
        description: 'Equipo de marketing',
        leaderId: null,
      },
    ]

    console.log('📦 Verificando equipos...')
    const createdTeams = []
    for (const team of teams) {
      let createdTeam = await prisma.team.findUnique({
        where: { name: team.name }
      })
      
      if (!createdTeam) {
        createdTeam = await prisma.team.create({
          data: team,
        })
        console.log(`✅ Equipo creado: ${createdTeam.name}`)
      } else {
        console.log(`ℹ️ Equipo ya existe: ${createdTeam.name}`)
      }
      createdTeams.push(createdTeam)
    }

    // Crear usuarios de prueba
    const users = [
      {
        email: 'admin@empresa.com',
        name: 'Administrador Principal',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        teamId: null,
      },
      {
        email: 'juan.perez@empresa.com',
        name: 'Juan Pérez',
        password: await bcrypt.hash('user123', 10),
        role: 'USER',
        teamId: null,
      },
      {
        email: 'maria.garcia@empresa.com',
        name: 'María García',
        password: await bcrypt.hash('user123', 10),
        role: 'MANAGER',
        teamId: null,
      },
      {
        email: 'carlos.lopez@empresa.com',
        name: 'Carlos López',
        password: await bcrypt.hash('user123', 10),
        role: 'USER',
        teamId: null,
      },
    ]

    console.log('👥 Verificando usuarios...')
    for (const user of users) {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      })
      
      if (!existingUser) {
        const createdUser = await prisma.user.create({
          data: user,
        })
        console.log(`✅ Usuario creado: ${createdUser.name} (${createdUser.role})`)
      } else {
        console.log(`ℹ️ Usuario ya existe: ${existingUser.name}`)
      }
    }

    // Asignar usuarios a equipos
    console.log('🔗 Asignando usuarios a equipos...')
    await prisma.user.updateMany({
      where: { email: 'juan.perez@empresa.com' },
      data: { teamId: createdTeams[0].id }
    })
    await prisma.user.updateMany({
      where: { email: 'maria.garcia@empresa.com' },
      data: { teamId: createdTeams[0].id }
    })
    await prisma.user.updateMany({
      where: { email: 'carlos.lopez@empresa.com' },
      data: { teamId: createdTeams[1].id }
    })

    // Asignar líderes a equipos
    const mariaUser = await prisma.user.findUnique({ where: { email: 'maria.garcia@empresa.com' } })
    const carlosUser = await prisma.user.findUnique({ where: { email: 'carlos.lopez@empresa.com' } })
    
    if (mariaUser) {
      await prisma.team.updateMany({
        where: { id: createdTeams[0].id },
        data: { leaderId: mariaUser.id }
      })
    }
    
    if (carlosUser) {
      await prisma.team.updateMany({
        where: { id: createdTeams[1].id },
        data: { leaderId: carlosUser.id }
      })
    }

    // Crear configuración del sistema
    console.log('⚙️ Verificando configuración del sistema...')
    const existingConfig = await prisma.systemConfig.findFirst()
    
    if (!existingConfig) {
      const systemConfig = await prisma.systemConfig.create({
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
      console.log(`✅ Configuración del sistema creada: ${systemConfig.name}`)
    } else {
      console.log(`ℹ️ Configuración del sistema ya existe: ${existingConfig.name}`)
    }

    console.log('🎉 Seed completado exitosamente!')
    console.log('\n📋 Credenciales de acceso:')
    console.log('👑 Admin: admin@empresa.com / admin123')
    console.log('👤 Usuario: juan.perez@empresa.com / user123')
    console.log('👨‍💼 Manager: maria.garcia@empresa.com / user123')
    console.log('👤 Usuario: carlos.lopez@empresa.com / user123')

  } catch (error) {
    console.error('❌ Error durante el seed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedUsers() 