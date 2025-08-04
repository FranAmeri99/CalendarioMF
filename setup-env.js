const fs = require('fs');
const crypto = require('crypto');

// Función para generar un secreto seguro
function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

// Función para verificar si el archivo .env existe
function checkEnvFile() {
  return fs.existsSync('.env');
}

// Función para leer el archivo .env existente
function readEnvFile() {
  if (!checkEnvFile()) return {};
  
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
  let content = '# Variables de entorno para la aplicación de gestión de asistencia\n\n';
  
  Object.entries(envVars).forEach(([key, value]) => {
    content += `${key}=${value}\n`;
  });
  
  fs.writeFileSync('.env', content);
  console.log('✅ Archivo .env creado/actualizado correctamente');
}

// Función principal
function setupEnvironment() {
  console.log('🔧 Configurando variables de entorno...\n');
  
  const existingVars = readEnvFile();
  
  // Variables requeridas
  const requiredVars = {
    DATABASE_URL: existingVars.DATABASE_URL || 'postgresql://usuario:contraseña@localhost:5432/asistencia_db',
    NEXTAUTH_SECRET: existingVars.NEXTAUTH_SECRET || generateSecret(),
    NEXTAUTH_URL: existingVars.NEXTAUTH_URL || 'http://localhost:3000'
  };
  
  // Mostrar las variables que se van a configurar
  console.log('Variables de entorno a configurar:');
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (key === 'DATABASE_URL' && !existingVars.DATABASE_URL) {
      console.log(`⚠️  ${key}: ${value} (CONFIGURAR MANUALMENTE)`);
    } else {
      console.log(`✅ ${key}: ${key === 'NEXTAUTH_SECRET' ? '[SECRETO GENERADO]' : value}`);
    }
  });
  
  console.log('\n📝 IMPORTANTE:');
  console.log('1. Configura la variable DATABASE_URL con tu conexión de PostgreSQL');
  console.log('2. Ejemplo de DATABASE_URL: postgresql://usuario:contraseña@localhost:5432/asistencia_db');
  console.log('3. Asegúrate de que PostgreSQL esté instalado y ejecutándose');
  
  // Escribir el archivo .env
  writeEnvFile(requiredVars);
  
  console.log('\n🎯 Próximos pasos:');
  console.log('1. Edita el archivo .env y configura tu DATABASE_URL');
  console.log('2. Ejecuta: npm run db:push');
  console.log('3. Ejecuta: npm run dev');
}

// Ejecutar el script
if (require.main === module) {
  setupEnvironment();
}

module.exports = { setupEnvironment }; 