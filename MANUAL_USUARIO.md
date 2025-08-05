# 📖 Manual de Usuario - Sistema de Gestión de Asistencia

## 🎯 Introducción

El **Sistema de Gestión de Asistencia** es una aplicación web diseñada para facilitar la gestión de asistencia de colaboradores a la oficina y la reserva de salas de reuniones. Este manual te guiará a través de todas las funcionalidades disponibles.

---

## 🔐 Acceso al Sistema

### Inicio de Sesión
1. **Abrir el navegador** y dirigirse a la URL del sistema
2. **Ingresar credenciales**:
   - **Email**: Tu dirección de correo electrónico
   - **Contraseña**: Tu contraseña asignada
3. **Hacer clic en "Iniciar Sesión"**

### Tipos de Usuario
- **Usuario Regular**: Puede hacer reservas y ver su información
- **Administrador**: Acceso completo a todas las funcionalidades del sistema

---

## 🏠 Dashboard Principal

### Vista General
El dashboard muestra una vista completa de tu actividad en el sistema:

#### 📊 Estadísticas Personales
- **Reservas Activas**: Número de reservas pendientes
- **Días Asistidos**: Total de días que has asistido
- **Próxima Reserva**: Fecha de tu próxima asistencia programada

#### 📅 Calendario Semanal
- Vista de la semana actual
- Reservas marcadas en verde
- Días bloqueados en gris
- Capacidad disponible por día

#### ⚡ Acciones Rápidas
- **Nueva Reserva**: Crear una reserva rápidamente
- **Ver Calendario**: Acceder al calendario completo
- **Mi Perfil**: Editar información personal

---

## 📅 Sistema de Reservas

### Crear una Nueva Reserva

#### Método 1: Desde el Dashboard
1. **Hacer clic en "Nueva Reserva"**
2. **Seleccionar fecha** en el calendario
3. **Confirmar la reserva**
4. **Recibir confirmación** por email

#### Método 2: Desde el Calendario
1. **Ir a "Calendario"** en el menú lateral
2. **Hacer clic en una fecha disponible**
3. **Confirmar la reserva**
4. **Ver la reserva marcada** en el calendario

### Gestionar Reservas Existentes

#### Ver Mis Reservas
1. **Ir a "Mis Reservas"** en el menú
2. **Ver lista de reservas** ordenadas por fecha
3. **Filtrar por estado** (Activas, Completadas, Canceladas)

#### Cancelar una Reserva
1. **Encontrar la reserva** en la lista
2. **Hacer clic en "Cancelar"**
3. **Confirmar la cancelación**
4. **Recibir confirmación** por email

#### Editar una Reserva
1. **Hacer clic en "Editar"** en la reserva
2. **Cambiar la fecha** si es necesario
3. **Guardar cambios**

### Reglas de Reserva
- **Anticipación mínima**: 2 horas antes
- **Anticipación máxima**: 30 días
- **Capacidad diaria**: Limitada según configuración
- **Fines de semana**: Según configuración del sistema
- **Días festivos**: Según configuración del sistema

---

## 🏢 Gestión de Salas de Reuniones

### Ver Salas Disponibles
1. **Ir a "Salas de Reuniones"** en el menú
2. **Ver lista de salas** con capacidad y estado
3. **Filtrar por disponibilidad**

### Reservar una Sala
1. **Seleccionar la sala** deseada
2. **Hacer clic en "Reservar"**
3. **Completar formulario**:
   - **Título**: Nombre de la reunión
   - **Descripción**: Detalles de la reunión
   - **Fecha y hora de inicio**
   - **Fecha y hora de fin**
4. **Confirmar reserva**

### Gestionar Mis Reservas de Salas
1. **Ver mis reservas** en la sección correspondiente
2. **Editar o cancelar** según necesidad
3. **Recibir notificaciones** de cambios

---

## 👥 Gestión de Equipos

### Ver Mi Equipo
1. **Ir a "Equipos"** en el menú
2. **Ver información del equipo**:
   - Nombre del equipo
   - Líder del equipo
   - Miembros
   - Descripción

### Reservas de Equipo
- **Ver reservas del equipo** en el calendario
- **Coordinar asistencia** con otros miembros
- **Recibir notificaciones** de reservas del equipo

---

## 👤 Perfil de Usuario

### Ver Mi Perfil
1. **Hacer clic en tu nombre** en la esquina superior derecha
2. **Seleccionar "Mi Perfil"**
3. **Ver información personal**:
   - Nombre y email
   - Equipo asignado
   - Rol en el sistema
   - Fecha de registro

### Editar Información
1. **Hacer clic en "Editar"**
2. **Modificar campos** permitidos:
   - Nombre
   - Email (solo administradores)
3. **Guardar cambios**

### Historial de Actividad
- **Ver todas las reservas** realizadas
- **Filtrar por período**
- **Exportar historial** (si está disponible)

---

## ⚙️ Panel de Administración

*Solo disponible para usuarios con rol de Administrador*

### Gestión de Usuarios
1. **Ir a "Administración > Usuarios"**
2. **Ver lista de usuarios** del sistema
3. **Acciones disponibles**:
   - **Agregar usuario**: Crear nueva cuenta
   - **Editar usuario**: Modificar información
   - **Cambiar rol**: Asignar permisos
   - **Desactivar usuario**: Suspender cuenta

#### Agregar Nuevo Usuario
1. **Hacer clic en "Agregar Usuario"**
2. **Completar formulario**:
   - Nombre completo
   - Email
   - Contraseña temporal
   - Rol (Usuario/Administrador)
   - Equipo (opcional)
3. **Guardar usuario**

### Configuración del Sistema
1. **Ir a "Administración > Configuración"**
2. **Modificar parámetros**:
   - **Capacidad diaria**: Máximo de personas por día
   - **Anticipación**: Días y horas mínimas/máximas
   - **Restricciones**: Fines de semana y festivos
   - **Cancelación automática**: Configurar inactividad

#### Configuraciones Disponibles
- **Máximo de personas por día**: 12 (configurable)
- **Permitir reservas en fin de semana**: No (configurable)
- **Permitir reservas en festivos**: No (configurable)
- **Días máximos de anticipación**: 30 (configurable)
- **Horas mínimas de anticipación**: 2 (configurable)
- **Cancelación automática**: Sí (configurable)
- **Horas de inactividad**: 24 (configurable)

---

## 📱 Uso en Dispositivos Móviles

### Navegación Táctil
- **Menú hamburguesa**: Acceso a todas las secciones
- **Gestos de deslizamiento**: Navegación entre vistas
- **Zoom**: Para ver detalles en calendarios

### Optimizaciones Móviles
- **Interfaz responsive**: Se adapta a cualquier pantalla
- **Botones táctiles**: Fácil acceso con el dedo
- **Notificaciones push**: Alertas en tiempo real

---

## 🔔 Notificaciones y Alertas

### Tipos de Notificaciones
- **Confirmación de reserva**: Al crear una reserva
- **Recordatorio**: 24 horas antes de la reserva
- **Cancelación**: Al cancelar una reserva
- **Cambios del sistema**: Actualizaciones importantes

### Configurar Notificaciones
1. **Ir a configuración personal**
2. **Seleccionar preferencias**:
   - Email
   - Notificaciones push
   - Recordatorios
3. **Guardar preferencias**

---

## 🚨 Solución de Problemas

### Problemas Comunes

#### No puedo hacer una reserva
- **Verificar disponibilidad**: La fecha puede estar llena
- **Revisar anticipación**: Cumplir con los límites de tiempo
- **Contactar administrador**: Si persiste el problema

#### No recibo confirmaciones por email
- **Verificar carpeta spam**: Los emails pueden estar ahí
- **Revisar configuración**: Asegurar email correcto
- **Contactar soporte**: Si el problema persiste

#### Error al iniciar sesión
- **Verificar credenciales**: Email y contraseña correctos
- **Limpiar caché**: Borrar datos del navegador
- **Usar modo incógnito**: Probar en ventana privada

#### El calendario no se carga
- **Refrescar página**: Recargar la aplicación
- **Verificar conexión**: Asegurar internet estable
- **Contactar soporte**: Si persiste el problema

### Contacto de Soporte
- **Email**: soporte@empresa.com
- **Teléfono**: +54 11 1234-5678
- **Horarios**: Lunes a Viernes 9:00 - 18:00

---

## 📋 Glosario de Términos

- **Reserva**: Asignación de un lugar en la oficina para una fecha específica
- **Sala de Reuniones**: Espacio para reuniones con capacidad limitada
- **Equipo**: Grupo de trabajo con líder y miembros
- **Capacidad**: Número máximo de personas permitidas por día
- **Anticipación**: Tiempo mínimo/máximo para hacer reservas
- **Cancelación automática**: Proceso que cancela reservas inactivas
- **Dashboard**: Panel principal con información resumida
- **Calendario**: Vista temporal de reservas y disponibilidad

---

## 🔄 Actualizaciones del Sistema

### Versión Actual
- **Número**: 1.0.0
- **Fecha**: Diciembre 2024
- **Características**: Sistema completo de gestión de asistencia

### Próximas Funcionalidades
- **App móvil nativa**: Para iOS y Android
- **Integración con calendarios**: Google Calendar, Outlook
- **Reportes avanzados**: Estadísticas detalladas
- **Notificaciones push**: Alertas en tiempo real

---

## 📞 Información de Contacto

### Soporte Técnico
- **Email**: soporte@empresa.com
- **Teléfono**: +54 11 1234-5678
- **Horarios**: Lunes a Viernes 9:00 - 18:00

### Administración del Sistema
- **Email**: admin@empresa.com
- **Teléfono**: +54 11 1234-5679

### Emergencias
- **WhatsApp**: +54 9 11 1234-5678
- **Horarios**: 24/7

---

*Este manual se actualiza regularmente. Para la versión más reciente, consulta con el administrador del sistema.*

**Última actualización**: Diciembre 2024
**Versión del manual**: 1.0 