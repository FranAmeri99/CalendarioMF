const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedUsers() {
  try {
    console.log('🌱 Iniciando seed de usuarios...')

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
        teamId: null, // Se asignará después de crear equipos
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

    // Crear equipos primero
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

    console.log('📦 Creando equipos...')
    const createdTeams = []
    for (const team of teams) {
      const createdTeam = await prisma.team.create({
        data: team,
      })
      createdTeams.push(createdTeam)
      console.log(`✅ Equipo creado: ${createdTeam.name}`)
    }

    // Crear usuarios
    console.log('👥 Creando usuarios...')
    for (const user of users) {
      const createdUser = await prisma.user.create({
        data: user,
      })
      console.log(`✅ Usuario creado: ${createdUser.name} (${createdUser.role})`)
    }

    // Asignar usuarios a equipos
    console.log('🔗 Asignando usuarios a equipos...')
    await prisma.user.update({
      where: { email: 'juan.perez@empresa.com' },
      data: { teamId: createdTeams[0].id }
    })
    await prisma.user.update({
      where: { email: 'maria.garcia@empresa.com' },
      data: { teamId: createdTeams[0].id }
    })
    await prisma.user.update({
      where: { email: 'carlos.lopez@empresa.com' },
      data: { teamId: createdTeams[1].id }
    })

    // Asignar líderes a equipos
    await prisma.team.update({
      where: { id: createdTeams[0].id },
      data: { leaderId: (await prisma.user.findUnique({ where: { email: 'maria.garcia@empresa.com' } })).id }
    })
    await prisma.team.update({
      where: { id: createdTeams[1].id },
      data: { leaderId: (await prisma.user.findUnique({ where: { email: 'carlos.lopez@empresa.com' } })).id }
    })

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