const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear equipos
  const team1 = await prisma.team.upsert({
    where: { name: 'Desarrollo' },
    update: {},
    create: {
      name: 'Desarrollo',
      description: 'Equipo de desarrollo de software'
    }
  });

  const team2 = await prisma.team.upsert({
    where: { name: 'Diseño' },
    update: {},
    create: {
      name: 'Diseño',
      description: 'Equipo de diseño UX/UI'
    }
  });

  const team3 = await prisma.team.upsert({
    where: { name: 'Marketing' },
    update: {},
    create: {
      name: 'Marketing',
      description: 'Equipo de marketing digital'
    }
  });

  console.log('✅ Equipos creados');

  // Crear usuarios
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      email: 'admin@empresa.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      teamId: team1.id
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'juan@empresa.com' },
    update: {},
    create: {
      email: 'juan@empresa.com',
      name: 'Juan Pérez',
      password: hashedPassword,
      role: 'USER',
      teamId: team1.id
    }
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'maria@empresa.com' },
    update: {},
    create: {
      email: 'maria@empresa.com',
      name: 'María García',
      password: hashedPassword,
      role: 'MANAGER',
      teamId: team2.id
    }
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'carlos@empresa.com' },
    update: {},
    create: {
      email: 'carlos@empresa.com',
      name: 'Carlos López',
      password: hashedPassword,
      role: 'USER',
      teamId: team3.id
    }
  });

  console.log('✅ Usuarios creados');

  // Crear reservas
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.reservation.upsert({
    where: {
      date_userId: {
        date: today,
        userId: user2.id
      }
    },
    update: {},
    create: {
      date: today,
      userId: user2.id,
      teamId: team1.id
    }
  });

  await prisma.reservation.upsert({
    where: {
      date_userId: {
        date: tomorrow,
        userId: user3.id
      }
    },
    update: {},
    create: {
      date: tomorrow,
      userId: user3.id,
      teamId: team2.id
    }
  });

  await prisma.reservation.upsert({
    where: {
      date_userId: {
        date: nextWeek,
        userId: user4.id
      }
    },
    update: {},
    create: {
      date: nextWeek,
      userId: user4.id,
      teamId: team3.id
    }
  });

  console.log('✅ Reservas creadas');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📋 Credenciales de prueba:');
  console.log('Admin: admin@empresa.com / password123');
  console.log('Usuario: juan@empresa.com / password123');
  console.log('Manager: maria@empresa.com / password123');
  console.log('Usuario: carlos@empresa.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 