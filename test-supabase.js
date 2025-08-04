const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Probando conexión a Supabase...\n');
  
  try {
    // Intentar conectar a la base de datos
    await prisma.$connect();
    console.log('✅ Conexión exitosa a Supabase!');
    
    // Verificar si las tablas existen
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'teams', 'reservations')
    `;
    
    console.log('\n📊 Tablas encontradas:');
    if (tables.length === 0) {
      console.log('❌ No se encontraron las tablas. Ejecuta: npm run db:push');
    } else {
      tables.forEach(table => {
        console.log(`✅ ${table.table_name}`);
      });
    }
    
    // Contar registros en cada tabla
    console.log('\n📈 Estadísticas de la base de datos:');
    
    try {
      const userCount = await prisma.user.count();
      console.log(`👥 Usuarios: ${userCount}`);
    } catch (e) {
      console.log('👥 Usuarios: Tabla no existe');
    }
    
    try {
      const teamCount = await prisma.team.count();
      console.log(`🏢 Equipos: ${teamCount}`);
    } catch (e) {
      console.log('🏢 Equipos: Tabla no existe');
    }
    
    try {
      const reservationCount = await prisma.reservation.count();
      console.log(`📅 Reservas: ${reservationCount}`);
    } catch (e) {
      console.log('📅 Reservas: Tabla no existe');
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n🔧 Soluciones posibles:');
    console.log('1. Verifica que la DATABASE_URL en .env sea correcta');
    console.log('2. Asegúrate de que el proyecto de Supabase esté activo');
    console.log('3. Verifica que la contraseña sea correcta');
    console.log('4. Asegúrate de que la región sea la correcta');
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
if (require.main === module) {
  testConnection();
}

module.exports = { testConnection }; 