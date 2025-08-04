const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function diagnoseConnection() {
  console.log('🔍 Diagnóstico detallado de Supabase...\n');
  
  try {
    console.log('📡 Intentando conectar a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa!');
    
    console.log('\n📊 Verificando tablas...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📋 Tablas encontradas:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    console.log('\n👥 Verificando usuarios...');
    const userCount = await prisma.user.count();
    console.log(`  - Total usuarios: ${userCount}`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: { email: true, role: true }
      });
      console.log('  - Usuarios disponibles:');
      users.forEach(user => {
        console.log(`    * ${user.email} (${user.role})`);
      });
    }
    
    console.log('\n🏢 Verificando equipos...');
    const teamCount = await prisma.team.count();
    console.log(`  - Total equipos: ${teamCount}`);
    
    console.log('\n📅 Verificando reservas...');
    const reservationCount = await prisma.reservation.count();
    console.log(`  - Total reservas: ${reservationCount}`);
    
    console.log('\n⚙️ Verificando configuración del sistema...');
    const config = await prisma.systemConfig.findFirst();
    if (config) {
      console.log('  - Configuración encontrada');
    } else {
      console.log('  - No hay configuración del sistema');
    }
    
    console.log('\n✅ Diagnóstico completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:');
    console.error('  - Mensaje:', error.message);
    console.error('  - Código:', error.code);
    console.error('  - Tipo:', error.constructor.name);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n🔧 Posibles soluciones:');
      console.log('  1. Verificar que la contraseña en Supabase sea correcta');
      console.log('  2. Verificar que no haya restricciones de IP en Supabase');
      console.log('  3. Verificar que el proyecto de Supabase esté activo');
      console.log('  4. Verificar la configuración de red en Supabase');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el diagnóstico
if (require.main === module) {
  diagnoseConnection();
}

module.exports = { diagnoseConnection }; 