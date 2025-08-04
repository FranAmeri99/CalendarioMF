// Configuración para generar DATABASE_URL desde variables de Supabase
export function getDatabaseUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;
  
  if (!supabaseUrl || !password) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD');
  }
  
  // Extraer el host de la URL de Supabase
  const host = supabaseUrl.replace('https://', '').replace('http://', '');
  
  return `postgresql://postgres:${password}@db.${host}:5432/postgres`;
}

// Configuración del cliente de Supabase
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
}; 