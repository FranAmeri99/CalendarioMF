# Sistema de Gestión de Asistencia Física a la Oficina

Una aplicación web completa para gestionar la asistencia de colaboradores a la oficina, con un sistema de reserva de lugares limitados (12 lugares por día) y gestión de equipos.

## 🚀 Características

### Funciones Principales

- **Dashboard Interactivo**: Vista general con estadísticas y calendario semanal
- **Gestión de Reservas**: Crear, editar y cancelar reservas de lugares en la oficina
- **ABM de Personas**: Alta, baja y modificación de colaboradores
- **Gestión de Equipos**: Crear y administrar equipos de trabajo
- **Perfil de Usuario**: Información personal e historial de reservas
- **Sistema de Autenticación**: Login seguro con NextAuth
- **Interfaz Responsiva**: Diseño adaptativo para móvil y escritorio

### Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: Material-UI (MUI) con Material Design
- **Base de Datos**: SQLite con Prisma ORM
- **Autenticación**: NextAuth.js
- **Estilos**: Tailwind CSS
- **Validación**: Zod + React Hook Form
- **Notificaciones**: React Hot Toast

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Git

## 🛠️ Instalación

### Opción 1: Con Supabase (Recomendado)

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd asistencia-app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Supabase**
   - Sigue la guía completa en `SUPABASE_SETUP.md`
   - Crea un proyecto en [supabase.com](https://supabase.com)
   - Obtén la URL de conexión

4. **Configurar variables de entorno**
   ```bash
   # Actualizar .env con tu URL de Supabase
   DATABASE_URL="postgresql://postgres:tu-password@db.tu-project.supabase.co:5432/postgres"
   NEXTAUTH_SECRET="tu-secreto-super-seguro-aqui"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. **Configurar la base de datos**
   ```bash
   # Generar el cliente de Prisma
   npm run db:generate
   
   # Crear las tablas en Supabase
   npm run db:push
   
   # Insertar datos de prueba
   npm run db:seed
   ```

6. **Ejecutar la aplicación**
   ```bash
   npm run dev
   ```

### Opción 2: Con SQLite (Desarrollo local)

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd asistencia-app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar SQLite**
   - Cambia el proveedor en `prisma/schema.prisma` a `sqlite`
   - Actualiza `DATABASE_URL` en `.env` a `file:./dev.db`

4. **Configurar la base de datos**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Ejecutar la aplicación**
   ```bash
   npm run dev
   ```

## 🗄️ Estructura de la Base de Datos

### Modelos Prisma

- **User**: Usuarios del sistema con roles y equipos
- **Team**: Equipos de trabajo con líderes y miembros
- **Reservation**: Reservas de lugares en la oficina

### Relaciones

- Un usuario puede pertenecer a un equipo
- Un equipo puede tener múltiples miembros
- Un equipo puede tener un líder
- Las reservas están asociadas a usuarios y equipos

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar linter

# Base de datos
npm run db:generate  # Generar cliente de Prisma
npm run db:push      # Sincronizar esquema con la base de datos
npm run db:migrate   # Ejecutar migraciones
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Insertar datos de prueba
npm run test:supabase # Probar conexión a Supabase
```

## 📱 Funcionalidades por Sección

### 🏠 Dashboard
- Vista de calendario semanal/mensual
- Estadísticas de ocupación
- Alertas cuando la oficina está completa
- Reservas recientes

### 📅 Gestión de Reservas
- Crear nuevas reservas
- Editar reservas existentes
- Cancelar reservas
- Filtros por fecha y equipo
- Validación de disponibilidad

### 👥 ABM de Personas
- Lista de colaboradores con búsqueda
- Agregar nuevos usuarios
- Editar información de usuarios
- Asignar roles (ADMIN, MANAGER, USER)
- Asignar usuarios a equipos

### 👨‍👩‍👧‍👦 Gestión de Equipos
- Crear nuevos equipos
- Editar información de equipos
- Asignar líderes a equipos
- Ver miembros por equipo
- Estadísticas de reservas por equipo

### 👤 Perfil de Usuario
- Información personal
- Historial de reservas
- Estadísticas de asistencia
- Opción para cambiar equipo
- Edición de datos personales

## 🔐 Sistema de Autenticación

### Roles de Usuario

- **ADMIN**: Acceso completo al sistema
- **MANAGER**: Gestión de equipos y reservas
- **USER**: Reservas propias y vista limitada

### Funciones por Rol

| Función | ADMIN | MANAGER | USER |
|---------|-------|---------|------|
| Ver Dashboard | ✅ | ✅ | ✅ |
| Crear Reservas | ✅ | ✅ | ✅ |
| Gestionar Usuarios | ✅ | ❌ | ❌ |
| Gestionar Equipos | ✅ | ✅ | ❌ |
| Ver Todas las Reservas | ✅ | ✅ | ❌ |

## 🎨 Diseño y UX

### Material Design
- Componentes MUI para consistencia visual
- Paleta de colores personalizada
- Iconografía coherente
- Tipografía optimizada

### Responsividad
- Diseño mobile-first
- Adaptación automática a diferentes pantallas
- Navegación optimizada para móviles

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Producción
npm run start

# Linting
npm run lint

# Base de datos
npm run db:generate    # Generar cliente Prisma
npm run db:push        # Sincronizar esquema
npm run db:migrate     # Ejecutar migraciones
npm run db:studio      # Abrir Prisma Studio
```

## 📊 Configuración de la Oficina

### Límites de Capacidad
- **12 lugares disponibles por día**
- **Sistema de alertas cuando está completo**
- **Validación automática de disponibilidad**

### Horarios
- Lunes a Viernes
- 9:00 AM - 6:00 PM
- Reservas por día completo

## 🔧 Personalización

### Variables de Entorno
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="tu-secreto"
NEXTAUTH_URL="http://localhost:3000"
```

### Configuración de Prisma
- Base de datos: SQLite (desarrollo) / PostgreSQL (producción)
- Migraciones automáticas
- Generación de tipos TypeScript

## 🐛 Solución de Problemas

### Errores Comunes

1. **Error de base de datos**
   ```bash
   npm run db:generate
   npm run db:push
   ```

2. **Error de autenticación**
   - Verificar variables de entorno
   - Reiniciar el servidor

3. **Error de dependencias**
   ```bash
   rm -rf node_modules
   npm install
   ```

## 📈 Próximas Mejoras

- [ ] Notificaciones push
- [ ] Reportes avanzados
- [ ] Integración con calendarios
- [ ] API REST completa
- [ ] Tests automatizados
- [ ] Docker deployment

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte técnico o preguntas, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ usando Next.js, Material-UI y Prisma** 