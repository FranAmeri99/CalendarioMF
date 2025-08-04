'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material'
import {
  Person,
  Email,
  Business,
  CalendarToday,
  Edit,
  Check,
  Close,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { UserService } from '@/lib/services/userService'
import { TeamService } from '@/lib/services/teamService'
import { ReservationService } from '@/lib/services/reservationService'
import type { UserWithTeam } from '@/lib/services/userService'
import type { Team } from '@prisma/client'
import type { ReservationWithUser } from '@/lib/services/reservationService'

interface UserProfile extends UserWithTeam {
  // Extendemos la interfaz si es necesario
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [reservations, setReservations] = useState<ReservationWithUser[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    teamId: '',
  })

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfileData()
    }
  }, [session])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      
      // Obtener datos del usuario actual
      const userEmail = session?.user?.email
      if (!userEmail) {
        throw new Error('No se encontró el email del usuario')
      }

      const userData = await UserService.getUserByEmail(userEmail)
      if (!userData) {
        throw new Error('Usuario no encontrado')
      }

      const [teamsData, reservationsData] = await Promise.all([
        TeamService.getSimpleTeams(),
        ReservationService.getReservationsByUser(userData.id),
      ])

      setProfile(userData)
      setTeams(teamsData)
      setReservations(reservationsData)

      // Inicializar formulario
      setFormData({
        name: userData.name,
        email: userData.email,
        teamId: userData.teamId || '',
      })
    } catch (error) {
      console.error('Error fetching profile data:', error)
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos del perfil',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        teamId: profile.teamId || '',
      })
    }
    setEditMode(true)
  }

  const handleCancel = () => {
    setEditMode(false)
    // Restaurar datos originales
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        teamId: profile.teamId || '',
      })
    }
  }

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.email) {
        setSnackbar({
          open: true,
          message: 'Debe completar todos los campos obligatorios',
          severity: 'error'
        })
        return
      }

      if (!profile) {
        setSnackbar({
          open: true,
          message: 'No se encontró el perfil del usuario',
          severity: 'error'
        })
        return
      }

      setSaving(true)

      // Actualizar usuario
      const updatedUser = await UserService.updateUser(profile.id, {
        name: formData.name,
        email: formData.email,
        teamId: formData.teamId || undefined,
      })

      setProfile(updatedUser)
      setEditMode(false)
      
      setSnackbar({
        open: true,
        message: 'Perfil actualizado exitosamente',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      setSnackbar({
        open: true,
        message: 'Error al actualizar el perfil',
        severity: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error'
      case 'MANAGER':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador'
      case 'MANAGER':
        return 'Manager'
      default:
        return 'Usuario'
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (!profile) {
    return (
      <Box>
        <Alert severity="error">
          No se pudo cargar el perfil del usuario
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Mi Perfil
        </Typography>
        {!editMode ? (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEdit}
          >
            Editar Perfil
          </Button>
        ) : (
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Close />}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              startIcon={<Check />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Información del Perfil */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Avatar
                sx={{ width: 100, height: 100, fontSize: '2rem' }}
              >
                {profile.name.charAt(0)}
              </Avatar>
              
              {editMode ? (
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    size="small"
                  />
                  <FormControl fullWidth size="small">
                    <InputLabel>Equipo</InputLabel>
                    <Select
                      value={formData.teamId}
                      onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                      label="Equipo"
                    >
                      <MenuItem value="">
                        <em>Sin equipo</em>
                      </MenuItem>
                      {teams.map((team) => (
                        <MenuItem key={team.id} value={team.id}>
                          {team.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              ) : (
                <Box sx={{ width: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    {profile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {profile.email}
                  </Typography>
                  <Chip
                    label={getRoleLabel(profile.role)}
                    color={getRoleColor(profile.role)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  {profile.team && (
                    <Chip
                      label={profile.team.name}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    Miembro desde: {new Date(profile.createdAt).toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Historial de Reservas */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Historial de Reservas
            </Typography>
            
            {reservations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No tienes reservas registradas
              </Typography>
            ) : (
              <List>
                {reservations.map((reservation, index) => (
                  <Box key={reservation.id}>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday />
                      </ListItemIcon>
                      <ListItemText
                        primary={format(new Date(reservation.date), 'EEEE, dd/MM/yyyy', { locale: es })}
                        secondary={reservation.team ? `Equipo: ${reservation.team.name}` : 'Sin equipo'}
                      />
                    </ListItem>
                    {index < reservations.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Estadísticas */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estadísticas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      {reservations.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reservas Totales
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      {reservations.filter(r => new Date(r.date) >= new Date()).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reservas Futuras
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      {reservations.length > 0 ? Math.round((reservations.filter(r => new Date(r.date) < new Date()).length / reservations.length) * 100) : 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tasa de Asistencia
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

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
    </Box>
  )
} 