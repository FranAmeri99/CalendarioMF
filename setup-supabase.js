const fs = require('fs');
const crypto = require('crypto');

// Función para generar un secreto seguro
function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

// Función para leer el archivo .env existente
function readEnvFile() {
  if (!fs.existsSync('.env')) return {};
  
  const content = fs.readFileSync('.env', 'utf8');
  const envVars = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=');
      }
    }
  });
  
  return envVars;
}

// Función para escribir el archivo .env
function writeEnvFile(envVars) {
  let content = '# Variables de entorno para la aplicación de gestión de asistencia\n';
  content += '# Configurado para Supabase\n\n';
  
  Object.entries(envVars).forEach(([key, value]) => {
    content += `${key}=${value}\n`;
  });
  
  fs.writeFileSync('.env', content);
  console.log('✅ Archivo .env actualizado correctamente');
}

// Función principal
function setupSupabase() {
  console.log('🔧 Configurando Supabase...\n');
  
  const existingVars = readEnvFile();
  
  // Variables requeridas para Supabase
  const requiredVars = {
    DATABASE_URL: existingVars.DATABASE_URL || 'postgresql://postgres:[TU-PASSWORD]@db.[TU-PROJECT-REF].supabase.co:5432/postgres',
    NEXTAUTH_SECRET: existingVars.NEXTAUTH_SECRET || generateSecret(),
    NEXTAUTH_URL: existingVars.NEXTAUTH_URL || 'http://localhost:3000'
  };
  
  console.log('📋 Configuración de Supabase:');
  console.log('1. Ve a https://supabase.com y crea una cuenta gratuita');
  console.log('2. Crea un nuevo proyecto');
  console.log('3. Ve a Settings > Database');
  console.log('4. Copia la "Connection string"');
  console.log('5. Reemplaza [TU-PASSWORD] con tu contraseña de base de datos\n');
  
  console.log('🔗 Ejemplo de DATABASE_URL para Supabase:');
  console.log('postgresql://postgres:tu-password@db.abcdefghijklmnop.supabase.co:5432/postgres\n');
  
  console.log('⚠️  IMPORTANTE:');
  console.log('- Reemplaza la DATABASE_URL con tu URL real de Supabase');
  console.log('- La URL debe incluir tu contraseña de base de datos');
  console.log('- Asegúrate de que el proyecto esté en la región más cercana a ti\n');
  
  // Escribir el archivo .env
  writeEnvFile(requiredVars);
  
  console.log('🎯 Próximos pasos:');
  console.log('1. Edita el archivo .env y configura tu DATABASE_URL de Supabase');
  console.log('2. Ejecuta: npm run db:push');
  console.log('3. Ejecuta: npm run db:seed');
  console.log('4. Ejecuta: npm run dev');
  
  console.log('\n📚 Recursos útiles:');
  console.log('- Documentación de Supabase: https://supabase.com/docs');
  console.log('- Guía de Prisma con Supabase: https://supabase.com/docs/guides/integrations/prisma');
}

// Ejecutar el script
if (require.main === module) {
  setupSupabase();
}

module.exports = { setupSupabase }; 