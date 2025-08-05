const { execSync } = require('child_process');

console.log('🔧 Configurando variables de entorno en Vercel...\n');

// Variables de entorno necesarias
const envVars = {
  DATABASE_URL: 'postgresql://postgres.idttntgqifwwngrzuaka:Fran1802Ameri@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  DIRECT_URL: 'postgresql://postgres.idttntgqifwwngrzuaka:Fran1802Ameri@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  NEXTAUTH_SECRET: 'tu-secreto-super-seguro-aqui',
  NEXTAUTH_URL: 'https://calendario-mf.vercel.app'
};

console.log('📋 Variables a configurar:');
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

console.log('\n⚠️  IMPORTANTE:');
console.log('1. Ejecuta estos comandos manualmente en tu terminal:');
console.log('2. Para cada variable, ejecuta: vercel env add <NOMBRE_VARIABLE>');
console.log('3. Selecciona "Production" cuando te pregunte por el entorno');
console.log('4. Copia y pega el valor correspondiente');

console.log('\n📝 Comandos a ejecutar:');
console.log('vercel env add DATABASE_URL');
console.log('vercel env add DIRECT_URL');
console.log('vercel env add NEXTAUTH_SECRET');
console.log('vercel env add NEXTAUTH_URL');

console.log('\n🎯 Después de configurar las variables:');
console.log('1. Ejecuta: vercel --prod');
console.log('2. O haz push a main para trigger automático');

console.log('\n✅ Configuración completada'); 