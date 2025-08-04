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
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  team?: {
    id: string
    name: string
  }
  avatar?: string
  createdAt: string
}

interface Reservation {
  id: string
  date: string
  team?: {
    name: string
  }
}

interface Team {
  id: string
  name: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    teamId: '',
  })

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      // Aquí se harían las llamadas a la API
      // Por ahora usamos datos de ejemplo
      setProfile({
        id: '1',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'ADMIN',
        team: { id: '1', name: 'Desarrollo' },
        createdAt: '2024-01-01',
      })

      setReservations([
        {
          id: '1',
          date: '2024-01-15',
          team: { name: 'Desarrollo' },
        },
        {
          id: '2',
          date: '2024-01-16',
          team: { name: 'Desarrollo' },
        },
        {
          id: '3',
          date: '2024-01-17',
          team: { name: 'Desarrollo' },
        },
      ])

      setTeams([
        { id: '1', name: 'Desarrollo' },
        { id: '2', name: 'Diseño' },
        { id: '3', name: 'Marketing' },
      ])

      if (profile) {
        setFormData({
          name: profile.name,
          email: profile.email,
          teamId: profile.team?.id || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
      toast.error('Error al cargar los datos del perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        teamId: profile.team?.id || '',
      })
    }
    setEditMode(true)
  }

  const handleCancel = () => {
    setEditMode(false)
  }

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.email) {
        toast.error('Debe completar todos los campos obligatorios')
        return
      }

      // Aquí se haría la llamada a la API
      toast.success('Perfil actualizado exitosamente')
      setEditMode(false)
      fetchProfileData()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error al actualizar el perfil')
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Cargando perfil...</Typography>
      </Box>
    )
  }

  if (!profile) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Perfil no encontrado
        </Typography>
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
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
                              startIcon={<Check />}
              onClick={handleSave}
            >
              Guardar
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
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <FormControl fullWidth>
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
                    label={profile.role}
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
                      {Math.round((reservations.length / 30) * 100)}%
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
    </Box>
  )
} 