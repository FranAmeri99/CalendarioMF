# Sistema de Gestión de Asistencia y Reservas

Una aplicación web completa para gestionar la asistencia de colaboradores a la oficina y reservas de salas de reuniones, con un sistema unificado de calendario y gestión de equipos.

## 🚀 Características

### Funciones Principales

- **Dashboard Interactivo**: Vista general con estadísticas y calendario semanal
- **Sistema Unificado de Reservas**: Gestión de asistencia y salas de reuniones en un solo lugar
- **Calendario Integrado**: Vista mensual con reservas de asistencia y salas de reuniones
- **Gestión de Salas de Reuniones**: Crear, editar y eliminar salas de reuniones
- **ABM de Personas**: Alta, baja y modificación de colaboradores
- **Gestión de Equipos**: Crear y administrar equipos de trabajo
- **Perfil de Usuario**: Información personal e historial de reservas
- **Sistema de Autenticación**: Login seguro con NextAuth
- **Interfaz Mobile-First**: Diseño completamente responsive optimizado para móviles

### Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: Material-UI (MUI) con Material Design
- **Base de Datos**: PostgreSQL con Prisma ORM (Supabase)
- **Autenticación**: NextAuth.js
- **Estilos**: Tailwind CSS
- **Notificaciones**: Sonner Toast
- **Iconos**: Lucide React

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Git
- Cuenta de Supabase (recomendado)

## 🛠️ Instalación

### Configuración con Supabase (Recomendado)

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/FranAmeri99/CalendarioMF.git
   cd asistencia
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Supabase**
   - Sigue la guía completa en `SUPABASE_SETUP.md`
   - Crea un proyecto en [supabase.com](https://supabase.com)
   - Obtén la URL de conexión y anon key

4. **Configurar variables de entorno**
   ```bash
   # Copiar archivo de ejemplo
   cp env.example .env.local
   
   # Configurar variables en .env.local
   DATABASE_URL="postgresql://postgres:tu-password@db.tu-project.supabase.co:5432/postgres"
   NEXTAUTH_SECRET="tu-secreto-super-seguro-aqui"
   NEXTAUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_SUPABASE_URL="https://tu-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
   ```

5. **Configurar la base de datos**
   ```bash
   # Generar el cliente de Prisma
   npx prisma generate
   
   # Crear las tablas en Supabase
   npx prisma db push
   
   # Insertar datos de prueba
   node src/scripts/seed-users.js
   ```

6. **Ejecutar la aplicación**
   ```bash
   npm run dev
   ```

## 🗄️ Estructura de la Base de Datos

### Modelos Prisma

- **User**: Usuarios del sistema con roles y equipos
- **Team**: Equipos de trabajo con líderes y miembros
- **Reservation**: Reservas de asistencia a la oficina
- **MeetingRoom**: Salas de reuniones disponibles
- **MeetingRoomBooking**: Reservas de salas de reuniones
- **SystemConfig**: Configuración del sistema (límites, etc.)

### Relaciones

- Un usuario puede pertenecer a un equipo
- Un equipo puede tener múltiples miembros y un líder
- Las reservas de asistencia están asociadas a usuarios y equipos
- Las reservas de salas están asociadas a usuarios y salas específicas

## 📱 Funcionalidades por Sección

### 🏠 Dashboard
- Vista de calendario semanal/mensual
- Estadísticas de ocupación de asistencia
- Reservas próximas de asistencia y salas
- Métricas de ocupación semanal
- Diseño completamente responsive

### 📅 Gestión de Reservas (Unificado)
- **Calendario Integrado**: Vista mensual con ambos tipos de reservas
- **Reservas de Asistencia**: 
  - Registro de asistencia diaria
  - Límite configurable de lugares (12 por defecto)
  - Asignación automática de equipo
  - Eliminación de reservas propias
- **Reservas de Salas de Reuniones**:
  - Crear reservas con título, descripción y horarios
  - Selección de sala específica
  - Validación de conflictos de horarios
  - Eliminación de reservas propias

### 🏢 Gestión de Salas de Reuniones
- Crear nuevas salas de reuniones
- Editar información de salas
- Activar/desactivar salas
- Ver capacidad y descripción
- Gestión completa desde panel de administración

### 👥 ABM de Personas
- Lista de colaboradores con búsqueda
- Agregar nuevos usuarios
- Editar información de usuarios
- Asignar roles (ADMIN, MANAGER, USER)
- Asignar usuarios a equipos
- Cambio de contraseñas

### 👨‍👩‍👧‍👦 Gestión de Equipos
- Crear nuevos equipos
- Editar información de equipos
- Asignar líderes a equipos
- Ver miembros por equipo
- Estadísticas de reservas por equipo

### 👤 Perfil de Usuario
- Información personal editable
- Historial de reservas de asistencia
- Estadísticas de asistencia
- Opción para cambiar equipo
- Edición de datos personales y contraseña

## 🔐 Sistema de Autenticación

### Roles de Usuario

- **ADMIN**: Acceso completo al sistema
- **MANAGER**: Gestión de equipos y reservas
- **USER**: Reservas propias y vista limitada

### Funciones por Rol

| Función | ADMIN | MANAGER | USER |
|---------|-------|---------|------|
| Ver Dashboard | ✅ | ✅ | ✅ |
| Crear Reservas de Asistencia | ✅ | ✅ | ✅ |
| Crear Reservas de Salas | ✅ | ✅ | ✅ |
| Gestionar Usuarios | ✅ | ❌ | ❌ |
| Gestionar Equipos | ✅ | ✅ | ❌ |
| Gestionar Salas de Reuniones | ✅ | ✅ | ❌ |
| Ver Todas las Reservas | ✅ | ✅ | ❌ |

## 🎨 Diseño y UX

### Material Design Mobile-First
- Componentes MUI optimizados para móviles
- Paleta de colores personalizada
- Iconografía coherente con Lucide React
- Tipografía responsive
- Modales optimizados con ancho aumentado

### Responsividad Avanzada
- **Diseño mobile-first** completamente implementado
- **Modales optimizados**: Ancho aumentado de 425px a 600px/500px
- **Campos touch-friendly**: Altura aumentada para mejor interacción
- **Espaciado adaptativo**: Gaps y padding optimizados por breakpoint
- **Navegación móvil**: Drawer optimizado para pantallas pequeñas
- **Botones responsive**: Full-width en móviles, auto en desktop

### Optimizaciones Mobile
- **AppBar responsive**: Título simplificado en móviles
- **Drawer optimizado**: Ancho adaptativo y mejor espaciado
- **Tablas responsive**: Columnas ocultas en pantallas pequeñas
- **Grid adaptativo**: Layouts que se ajustan automáticamente
- **Tipografía escalable**: Tamaños de fuente optimizados

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar linter

# Base de datos
npx prisma generate  # Generar cliente de Prisma
npx prisma db push   # Sincronizar esquema con la base de datos
npx prisma studio    # Abrir Prisma Studio
node src/scripts/seed-users.js # Insertar datos de prueba

# Utilidades
npm run test:supabase # Probar conexión a Supabase
```

## 📊 Configuración del Sistema

### Límites de Capacidad
- **12 lugares disponibles por día** para asistencia
- **Sistema de alertas** cuando está completo
- **Validación automática** de disponibilidad
- **Configuración dinámica** desde base de datos

### Salas de Reuniones
- **Capacidad configurable** por sala
- **Estado activo/inactivo**
- **Descripción detallada**
- **Validación de conflictos** de horarios

### Horarios
- **Asistencia**: Lunes a Viernes, día completo
- **Salas de Reuniones**: Horarios flexibles configurables
- **Validación de fechas** futuras

## 🔧 Personalización

### Variables de Entorno
```env
# Base de datos
DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="tu-secreto"
NEXTAUTH_URL="http://localhost:3000"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
SUPABASE_DB_PASSWORD="tu-password"
```

### Configuración de Prisma
- Base de datos: PostgreSQL (Supabase)
- Migraciones automáticas con `db push`
- Generación de tipos TypeScript
- Relaciones optimizadas

## 🐛 Solución de Problemas

### Errores Comunes

1. **Error de base de datos**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Error de autenticación**
   - Verificar variables de entorno
   - Reiniciar el servidor

3. **Error de dependencias**
   ```bash
   rm -rf node_modules
   npm install
   ```

4. **Problemas de responsive**
   - Verificar breakpoints en componentes
   - Revisar clases de Tailwind

## 📈 Mejoras Implementadas

### ✅ Completadas
- [x] Sistema unificado de calendario
- [x] Gestión de salas de reuniones
- [x] Diseño mobile-first completo
- [x] Modales optimizados y responsive
- [x] Eliminación de reservas propias
- [x] Asignación automática de equipos
- [x] Interfaz completamente responsive
- [x] Optimización de UX móvil
- [x] Consolidación de funcionalidades

### 🚧 Próximas Mejoras
- [ ] Notificaciones push
- [ ] Reportes avanzados
- [ ] Integración con calendarios externos
- [ ] API REST completa
- [ ] Tests automatizados
- [ ] Docker deployment
- [ ] Exportación de datos
- [ ] Dashboard analítico

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte técnico o preguntas, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ usando Next.js, Material-UI, Prisma y Supabase**

### 🎯 Características Destacadas

- **Sistema Unificado**: Asistencia y salas de reuniones en un solo lugar
- **Mobile-First**: Optimizado completamente para dispositivos móviles
- **UX Mejorada**: Modales más anchos y campos touch-friendly
- **Responsive Design**: Adaptación perfecta a todas las pantallas
- **Gestión Completa**: Usuarios, equipos, salas y reservas
- **Autenticación Segura**: NextAuth con roles y permisos 