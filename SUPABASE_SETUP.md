# 🚀 Configuración de Supabase

Esta guía te ayudará a configurar Supabase para tu aplicación de gestión de asistencia.

## 📋 Pasos para configurar Supabase

### 1. Crear cuenta en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Crea una cuenta gratuita (no requiere tarjeta de crédito)

### 2. Crear un nuevo proyecto
1. Haz clic en "New Project"
2. Selecciona tu organización
3. Elige un nombre para tu proyecto (ej: "asistencia-app")
4. Establece una contraseña segura para la base de datos
5. Selecciona la región más cercana a tu ubicación
6. Haz clic en "Create new project"

### 3. Obtener la URL de conexión
1. Una vez creado el proyecto, ve a **Settings** > **Database**
2. Busca la sección **Connection string**
3. Copia la URL que aparece en **URI**
4. Reemplaza `[YOUR-PASSWORD]` con la contraseña que estableciste

### 4. Configurar el archivo .env
1. Abre el archivo `.env` en tu proyecto
2. Reemplaza la línea `DATABASE_URL` con tu URL de Supabase
3. Ejemplo:
   ```
   DATABASE_URL=postgresql://postgres:tu-contraseña@db.abcdefghijklmnop.supabase.co:5432/postgres
   ```

### 5. Crear las tablas en Supabase
Ejecuta estos comandos en tu terminal:

```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear las tablas en Supabase
npm run db:push

# Insertar datos de prueba
npm run db:seed
```

### 6. Verificar la conexión
Ejecuta este comando para verificar que todo funciona:

```bash
npm run db:studio
```

## 🔧 Configuración adicional (opcional)

### Habilitar Row Level Security (RLS)
Para mayor seguridad, puedes habilitar RLS en Supabase:

1. Ve a **Authentication** > **Policies**
2. Habilita RLS en las tablas: `users`, `teams`, `reservations`
3. Crea políticas personalizadas según tus necesidades

### Configurar autenticación con Supabase Auth
Si quieres usar la autenticación de Supabase en lugar de NextAuth:

1. Ve a **Authentication** > **Settings**
2. Configura los proveedores que necesites (Google, GitHub, etc.)
3. Actualiza la configuración de NextAuth en tu aplicación

## 🚨 Solución de problemas

### Error: "Connection refused"
- Verifica que la URL de conexión sea correcta
- Asegúrate de que la contraseña esté bien escrita
- Verifica que el proyecto esté activo en Supabase

### Error: "Database does not exist"
- La base de datos se crea automáticamente en Supabase
- Verifica que estés usando la URL correcta del proyecto

### Error: "Permission denied"
- Verifica que la contraseña sea correcta
- Asegúrate de que el proyecto esté en la región correcta

## 📊 Ventajas de usar Supabase

✅ **Base de datos PostgreSQL** completa y escalable
✅ **Panel de administración** web para gestionar datos
✅ **Autenticación** integrada (opcional)
✅ **API REST** automática
✅ **Tiempo real** con WebSockets
✅ **Almacenamiento** de archivos
✅ **Gratis** hasta 500MB de base de datos

## 🔗 Enlaces útiles

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Prisma con Supabase](https://supabase.com/docs/guides/integrations/prisma)
- [Panel de administración de Supabase](https://app.supabase.com)

## 🎯 Próximos pasos

Una vez configurado Supabase:

1. Ejecuta `npm run dev` para iniciar la aplicación
2. Accede a http://localhost:3000
3. Usa las credenciales de prueba para probar la aplicación
4. Personaliza la aplicación según tus necesidades

¡Tu aplicación estará lista para usar con Supabase! 🚀 