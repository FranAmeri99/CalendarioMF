'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Snackbar,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material'
import {
  Settings,
  People,
  CalendarToday,
  Warning,
} from '@mui/icons-material'
import { ConfigService } from '@/lib/services/configService'
import type { SystemConfig } from '@/lib/services/configService'

export default function AdminConfigPage() {
  const [config, setConfig] = useState<SystemConfig>({
    maxSpotsPerDay: 12,
    allowWeekendReservations: false,
    allowHolidayReservations: false,
    maxAdvanceBookingDays: 30,
    minAdvanceBookingHours: 2,
    autoCancelInactiveReservations: true,
    inactiveReservationHours: 24,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  // Cargar configuración inicial
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const configData = await ConfigService.getConfig()
      setConfig(configData)
    } catch (error) {
      console.error('Error loading config:', error)
      setSnackbar({
        open: true,
        message: 'Error al cargar la configuración',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await ConfigService.updateConfig(config)
      setSnackbar({
        open: true,
        message: 'Configuración guardada correctamente',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error saving config:', error)
      setSnackbar({
        open: true,
        message: 'Error al guardar la configuración',
        severity: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (window.confirm('¿Estás seguro de que quieres restaurar la configuración por defecto?')) {
      try {
        setSaving(true)
        const defaultConfig = await ConfigService.createDefaultConfig()
        setConfig(defaultConfig)
        setSnackbar({
          open: true,
          message: 'Configuración restaurada a valores por defecto',
          severity: 'info'
        })
      } catch (error) {
        console.error('Error resetting config:', error)
        setSnackbar({
          open: true,
          message: 'Error al restaurar la configuración',
          severity: 'error'
        })
      } finally {
        setSaving(false)
      }
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Configuración del Sistema
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={saving}
            >
              Restaurar Valores
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>
        </Box>

        {/* Configuración de Capacidad */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Capacidad de la Oficina"
            subheader="Configura cuántas personas pueden asistir a la oficina por día"
            avatar={<People color="primary" />}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Máximo de personas por día"
                  type="number"
                  value={config.maxSpotsPerDay}
                  onChange={(e) => setConfig({ ...config, maxSpotsPerDay: parseInt(e.target.value) || 12 })}
                  inputProps={{ min: 1, max: 100 }}
                  helperText="Define cuántas personas pueden reservar lugar en la oficina por día"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={`${config.maxSpotsPerDay} personas máximo`}
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    por día en la oficina
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Configuración de Reservas */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Configuración de Reservas"
            subheader="Define las reglas para las reservas de la oficina"
            avatar={<CalendarToday color="primary" />}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Días máximos de anticipación"
                  type="number"
                  value={config.maxAdvanceBookingDays}
                  onChange={(e) => setConfig({ ...config, maxAdvanceBookingDays: parseInt(e.target.value) || 30 })}
                  inputProps={{ min: 1, max: 365 }}
                  helperText="Con cuántos días de anticipación se pueden hacer reservas"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Horas mínimas de anticipación"
                  type="number"
                  value={config.minAdvanceBookingHours}
                  onChange={(e) => setConfig({ ...config, minAdvanceBookingHours: parseInt(e.target.value) || 2 })}
                  inputProps={{ min: 0, max: 72 }}
                  helperText="Horas mínimas antes de la fecha para poder reservar"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Restricciones de Fechas
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.allowWeekendReservations}
                      onChange={(e) => setConfig({ ...config, allowWeekendReservations: e.target.checked })}
                    />
                  }
                  label="Permitir reservas en fin de semana"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.allowHolidayReservations}
                      onChange={(e) => setConfig({ ...config, allowHolidayReservations: e.target.checked })}
                    />
                  }
                  label="Permitir reservas en días festivos"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Configuración de Cancelación Automática */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Cancelación Automática"
            subheader="Configura el comportamiento de cancelación automática de reservas"
            avatar={<Warning color="primary" />}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.autoCancelInactiveReservations}
                      onChange={(e) => setConfig({ ...config, autoCancelInactiveReservations: e.target.checked })}
                    />
                  }
                  label="Cancelar automáticamente reservas inactivas"
                />
              </Grid>
              {config.autoCancelInactiveReservations && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Horas de inactividad"
                    type="number"
                    value={config.inactiveReservationHours}
                    onChange={(e) => setConfig({ ...config, inactiveReservationHours: parseInt(e.target.value) || 24 })}
                    inputProps={{ min: 1, max: 168 }}
                    helperText="Después de cuántas horas se cancela una reserva inactiva"
                  />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Resumen de Configuración */}
        <Card>
          <CardHeader
            title="Resumen de Configuración"
            subheader="Vista general de la configuración actual"
            avatar={<Settings color="primary" />}
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary">
                    {config.maxSpotsPerDay}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Personas por día
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary">
                    {config.maxAdvanceBookingDays}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Días de anticipación
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary">
                    {config.minAdvanceBookingHours}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Horas mínimas
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary">
                    {config.inactiveReservationHours}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Horas de inactividad
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Configuraciones Especiales:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={config.allowWeekendReservations ? 'Fin de semana permitido' : 'Fin de semana bloqueado'}
                  color={config.allowWeekendReservations ? 'success' : 'error'}
                  size="small"
                />
                <Chip
                  label={config.allowHolidayReservations ? 'Festivos permitidos' : 'Festivos bloqueados'}
                  color={config.allowHolidayReservations ? 'success' : 'error'}
                  size="small"
                />
                <Chip
                  label={config.autoCancelInactiveReservations ? 'Cancelación automática activa' : 'Cancelación automática desactivada'}
                  color={config.autoCancelInactiveReservations ? 'warning' : 'default'}
                  size="small"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
} 