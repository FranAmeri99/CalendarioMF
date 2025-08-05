# 🔧 Manual de Administrador - Sistema de Gestión de Asistencia

## 🎯 Introducción

Este manual está dirigido a **administradores del sistema** y proporciona información técnica detallada sobre la gestión, configuración y mantenimiento del Sistema de Gestión de Asistencia.

---

## 🔐 Acceso de Administrador

### Credenciales de Administrador
- **Rol**: ADMIN
- **Permisos**: Acceso completo a todas las funcionalidades
- **Acceso**: Panel de administración exclusivo

### Verificar Rol de Administrador
1. **Iniciar sesión** con credenciales de administrador
2. **Verificar en perfil**: Debe mostrar "Administrador"
3. **Acceder al panel**: Menú "Administración" visible

---

## 👥 Gestión de Usuarios

### Vista General de Usuarios
**Ruta**: `/dashboard/admin/users`

#### Funcionalidades Disponibles
- **Listar usuarios**: Ver todos los usuarios del sistema
- **Filtrar por rol**: Administradores, Usuarios
- **Buscar usuarios**: Por nombre o email
- **Exportar datos**: Lista completa de usuarios

### Crear Nuevo Usuario

#### Proceso Completo
1. **Ir a "Administración > Usuarios"**
2. **Hacer clic en "Agregar Usuario"**
3. **Completar formulario**:
   ```
   Nombre: [Nombre completo]
   Email: [email@empresa.com]
   Contraseña: [contraseña temporal]
   Rol: [Usuario/Administrador]
   Equipo: [Opcional - seleccionar equipo]
   ```
4. **Guardar usuario**
5. **Enviar credenciales** al usuario por email

#### Buenas Prácticas
- **Contraseñas temporales**: Usar contraseñas seguras pero fáciles de recordar
- **Comunicación**: Informar al usuario sobre su cuenta
- **Verificación**: Confirmar que el usuario puede acceder

### Editar Usuario Existente

#### Información Editable
- **Datos personales**: Nombre, email
- **Rol**: Cambiar entre Usuario y Administrador
- **Equipo**: Asignar o cambiar equipo
- **Estado**: Activar/desactivar cuenta

#### Proceso de Edición
1. **Encontrar usuario** en la lista
2. **Hacer clic en "Editar"**
3. **Modificar campos** necesarios
4. **Guardar cambios**
5. **Notificar al usuario** si es necesario

### Desactivar Usuario
1. **Seleccionar usuario** de la lista
2. **Hacer clic en "Desactivar"**
3. **Confirmar acción**
4. **El usuario no podrá acceder** hasta ser reactivado

### Reactivar Usuario
1. **Encontrar usuario desactivado**
2. **Hacer clic en "Reactivar"**
3. **Confirmar acción**
4. **El usuario podrá acceder** nuevamente

---

## ⚙️ Configuración del Sistema

### Acceso a Configuración
**Ruta**: `/dashboard/admin/config`

### Parámetros Configurables

#### 1. Capacidad de la Oficina
- **Máximo de personas por día**: 12 (configurable 1-100)
- **Descripción**: Número máximo de reservas permitidas por día
- **Impacto**: Afecta la disponibilidad de reservas

#### 2. Configuración de Reservas
- **Días máximos de anticipación**: 30 (configurable 1-365)
- **Horas mínimas de anticipación**: 2 (configurable 0-72)
- **Descripción**: Límites de tiempo para hacer reservas

#### 3. Restricciones de Fechas
- **Permitir reservas en fin de semana**: No (configurable)
- **Permitir reservas en días festivos**: No (configurable)
- **Descripción**: Control de disponibilidad por tipo de día

#### 4. Cancelación Automática
- **Cancelar automáticamente reservas inactivas**: Sí (configurable)
- **Horas de inactividad**: 24 (configurable 1-168)
- **Descripción**: Sistema de limpieza automática

### Proceso de Configuración
1. **Acceder a configuración**
2. **Modificar parámetros** según necesidades
3. **Guardar cambios**
4. **Verificar impacto** en el sistema
5. **Notificar usuarios** si es necesario

### Configuraciones Recomendadas

#### Para Oficinas Pequeñas (1-20 personas)
```
Máximo de personas por día: 15
Días máximos de anticipación: 14
Horas mínimas de anticipación: 1
Permitir fin de semana: No
Permitir festivos: No
Cancelación automática: Sí
Horas de inactividad: 12
```

#### Para Oficinas Medianas (21-50 personas)
```
Máximo de personas por día: 35
Días máximos de anticipación: 30
Horas mínimas de anticipación: 2
Permitir fin de semana: No
Permitir festivos: No
Cancelación automática: Sí
Horas de inactividad: 24
```

#### Para Oficinas Grandes (51+ personas)
```
Máximo de personas por día: 80
Días máximos de anticipación: 60
Horas mínimas de anticipación: 4
Permitir fin de semana: Sí
Permitir festivos: Sí
Cancelación automática: Sí
Horas de inactividad: 48
```

---

## 📊 Monitoreo y Reportes

### Dashboard de Administración
**Ruta**: `/dashboard/admin`

#### Métricas Disponibles
- **Usuarios activos**: Número de usuarios con sesión reciente
- **Reservas totales**: Total de reservas en el sistema
- **Capacidad utilizada**: Porcentaje de ocupación actual
- **Reservas pendientes**: Reservas para los próximos días

### Reportes Disponibles

#### 1. Reporte de Asistencia
- **Período**: Seleccionable (semana, mes, año)
- **Usuarios**: Todos o por equipo
- **Métricas**: Días asistidos, frecuencia, tendencias

#### 2. Reporte de Capacidad
- **Ocupación diaria**: Porcentaje de uso por día
- **Picos de demanda**: Días con mayor reservas
- **Días subutilizados**: Días con baja ocupación

#### 3. Reporte de Usuarios
- **Actividad por usuario**: Reservas realizadas
- **Equipos más activos**: Estadísticas por equipo
- **Usuarios inactivos**: Usuarios sin reservas recientes

### Exportación de Datos
- **Formato**: CSV, Excel
- **Período**: Personalizable
- **Filtros**: Por usuario, equipo, fecha

---

## 🏢 Gestión de Salas de Reuniones

### Crear Nueva Sala
1. **Ir a "Salas de Reuniones"**
2. **Hacer clic en "Agregar Sala"**
3. **Completar información**:
   ```
   Nombre: [Nombre de la sala]
   Descripción: [Descripción opcional]
   Capacidad: [Número máximo de personas]
   Estado: [Activa/Inactiva]
   ```
4. **Guardar sala**

### Editar Sala Existente
1. **Seleccionar sala** de la lista
2. **Hacer clic en "Editar"**
3. **Modificar parámetros**:
   - Nombre y descripción
   - Capacidad
   - Estado (Activa/Inactiva)
4. **Guardar cambios**

### Eliminar Sala
1. **Seleccionar sala** a eliminar
2. **Verificar reservas**: No debe tener reservas activas
3. **Hacer clic en "Eliminar"**
4. **Confirmar acción**

---

## 🔧 Mantenimiento del Sistema

### Tareas Diarias
- **Revisar reservas**: Verificar reservas del día
- **Monitorear errores**: Revisar logs del sistema
- **Respaldar datos**: Backup automático (configurado)

### Tareas Semanales
- **Revisar reportes**: Analizar métricas de uso
- **Limpiar datos**: Eliminar reservas antiguas
- **Actualizar configuración**: Ajustar según necesidades

### Tareas Mensuales
- **Auditoría de usuarios**: Revisar usuarios inactivos
- **Análisis de tendencias**: Estudiar patrones de uso
- **Optimización**: Ajustar configuración según datos

### Backup y Recuperación

#### Backup Automático
- **Frecuencia**: Diaria
- **Ubicación**: Supabase (configurado automáticamente)
- **Retención**: 30 días

#### Backup Manual
1. **Acceder a Supabase Dashboard**
2. **Ir a "Database"**
3. **Seleccionar "Backups"**
4. **Crear backup manual**

#### Recuperación de Datos
1. **Identificar problema**: Qué datos se perdieron
2. **Seleccionar backup**: Elegir punto de restauración
3. **Restaurar datos**: Proceso automático
4. **Verificar integridad**: Confirmar que todo funciona

---

## 🚨 Solución de Problemas

### Problemas Comunes de Administración

#### Usuario no puede acceder
1. **Verificar credenciales**: Email y contraseña correctos
2. **Revisar estado**: Usuario activo/inactivo
3. **Verificar rol**: Permisos correctos
4. **Resetear contraseña**: Si es necesario

#### Error en configuración
1. **Revisar valores**: Parámetros dentro de rangos válidos
2. **Verificar sintaxis**: Formato correcto
3. **Probar cambios**: Aplicar uno por uno
4. **Restaurar configuración**: Si es necesario

#### Sistema lento
1. **Revisar carga**: Número de usuarios concurrentes
2. **Optimizar consultas**: Verificar base de datos
3. **Limpiar caché**: Borrar datos temporales
4. **Escalar recursos**: Si es necesario

#### Datos corruptos
1. **Identificar problema**: Qué datos están afectados
2. **Crear backup**: Antes de cualquier cambio
3. **Restaurar desde backup**: Punto anterior
4. **Verificar integridad**: Confirmar funcionamiento

### Logs del Sistema

#### Acceso a Logs
- **Supabase Dashboard**: Logs de base de datos
- **Vercel Dashboard**: Logs de aplicación
- **Navegador**: Console para errores frontend

#### Tipos de Logs
- **Error**: Problemas críticos del sistema
- **Warning**: Advertencias importantes
- **Info**: Información general
- **Debug**: Detalles técnicos

---

## 📈 Optimización del Sistema

### Rendimiento
- **Caché**: Configurar caché para consultas frecuentes
- **Índices**: Optimizar consultas de base de datos
- **CDN**: Usar CDN para archivos estáticos
- **Compresión**: Activar compresión de respuestas

### Seguridad
- **Contraseñas**: Política de contraseñas seguras
- **Sesiones**: Tiempo de expiración de sesiones
- **Acceso**: Control de acceso por IP (opcional)
- **Auditoría**: Logs de acceso y cambios

### Escalabilidad
- **Base de datos**: Monitorear crecimiento
- **Almacenamiento**: Planificar expansión
- **Usuarios**: Preparar para crecimiento
- **Funcionalidades**: Evaluar nuevas necesidades

---

## 🔄 Actualizaciones del Sistema

### Proceso de Actualización
1. **Notificar usuarios**: Comunicar cambios
2. **Crear backup**: Antes de actualizar
3. **Aplicar actualización**: Proceso automático
4. **Verificar funcionamiento**: Pruebas post-actualización
5. **Comunicar éxito**: Confirmar a usuarios

### Versiones del Sistema
- **Actual**: v1.0.0
- **Próxima**: v1.1.0 (funcionalidades adicionales)
- **Roadmap**: Plan de desarrollo futuro

---

## 📞 Soporte Técnico

### Contacto Interno
- **Email**: admin@empresa.com
- **Teléfono**: +54 11 1234-5679
- **Horarios**: Lunes a Viernes 9:00 - 18:00

### Contacto Externo (Desarrollo)
- **Email**: desarrollo@empresa.com
- **Teléfono**: +54 11 1234-5680
- **Horarios**: Lunes a Viernes 9:00 - 18:00

### Emergencias
- **WhatsApp**: +54 9 11 1234-5678
- **Horarios**: 24/7

---

## 📋 Checklist de Administración

### Diario
- [ ] Revisar reservas del día
- [ ] Verificar errores del sistema
- [ ] Monitorear métricas básicas

### Semanal
- [ ] Revisar reportes de uso
- [ ] Limpiar datos antiguos
- [ ] Verificar backups

### Mensual
- [ ] Auditoría de usuarios
- [ ] Análisis de tendencias
- [ ] Optimización de configuración

### Trimestral
- [ ] Revisión de seguridad
- [ ] Evaluación de rendimiento
- [ ] Planificación de mejoras

---

*Este manual se actualiza regularmente. Para la versión más reciente, consulta con el equipo de desarrollo.*

**Última actualización**: Diciembre 2024
**Versión del manual**: 1.0 