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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
} from '@mui/material'
import {
  Person,
  Email,
  Business,
  CalendarToday,
  Edit,
  Check,
  Close,
  Add,
  Delete,
} from '@mui/icons-material'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

// Configurar dayjs con locale español
dayjs.locale('es')

// Tipos locales
interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  teamId?: string // Mantener para compatibilidad
  team?: {
    id: string
    name: string
  }
  teams?: {
    id: string
    name: string
    description?: string
    leader?: {
      id: string
      name: string
      email: string
    }
    members?: {
      id: string
      name: string
      email: string
    }[]
  }[] // Nueva relación muchos a muchos con detalles
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
  description?: string
  leader?: {
    id: string
    name: string
    email: string
  }
  members?: {
    id: string
    name: string
    email: string
  }[]
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
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
    teamId: '', // Mantener para compatibilidad
    password: '',
  })
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfileData()
    }
  }, [session])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      
      const userEmail = session?.user?.email
      if (!userEmail) {
        throw new Error('No se encontró el email del usuario')
      }

      // Obtener datos del usuario
      const userResponse = await fetch(`/api/users?email=${userEmail}`)
      if (!userResponse.ok) {
        throw new Error('Usuario no encontrado')
      }
      const userData = await userResponse.json()

      // Obtener equipos y reservas en paralelo
      const [teamsResponse, reservationsResponse] = await Promise.all([
        fetch('/api/teams'),
        fetch(`/api/reservations?userId=${userData.id}`)
      ])

      const teamsData = teamsResponse.ok ? await teamsResponse.json() : []
      const reservationsData = reservationsResponse.ok ? await reservationsResponse.json() : []

      setProfile(userData)
      setTeams(teamsData)
      setReservations(reservationsData)

      // Inicializar formulario
      setFormData({
        name: userData.name,
        email: userData.email,
        teamId: userData.teamId || '',
        password: '',
      })

      // Inicializar equipos seleccionados
      setSelectedTeams(userData.teams?.map((team: any) => team.id) || [])
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
        password: '',
      })
      setSelectedTeams(profile.teams?.map(team => team.id) || [])
    }
    setEditMode(true)
  }

  const handleCancel = () => {
    setEditMode(false)
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        teamId: profile.teamId || '',
        password: '',
      })
      setSelectedTeams(profile.teams?.map(team => team.id) || [])
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
      const body: any = {
        name: formData.name,
        email: formData.email,
        teamId: formData.teamId || undefined,
      }
      if (formData.password) {
        body['password'] = formData.password
      }
      const response = await fetch(`/api/users/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        // Actualizar equipos del usuario
        const currentTeams = profile.teams?.map(team => team.id) || []
        
        // Agregar equipos nuevos
        for (const teamId of selectedTeams) {
          if (!currentTeams.includes(teamId)) {
            await fetch(`/api/users/${profile.id}/teams`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ teamId }),
            })
          }
        }

        // Remover equipos que ya no están seleccionados
        for (const teamId of currentTeams) {
          if (!selectedTeams.includes(teamId)) {
            await fetch(`/api/users/${profile.id}/teams/${teamId}`, {
              method: 'DELETE',
            })
          }
        }

        // Recargar datos del perfil
        await fetchProfileData()
        setEditMode(false)
        
        setSnackbar({
          open: true,
          message: 'Perfil actualizado exitosamente',
          severity: 'success'
        })
      } else {
        throw new Error('Error al actualizar')
      }
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

  const handleAddTeam = async (teamId: string) => {
    try {
      if (!profile) return

      const response = await fetch(`/api/users/${profile.id}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId }),
      })

      if (response.ok) {
        setSelectedTeams([...selectedTeams, teamId])
        setSnackbar({
          open: true,
          message: 'Equipo agregado exitosamente',
          severity: 'success'
        })
        // Recargar datos del perfil
        fetchProfileData()
      } else {
        throw new Error('Error al agregar equipo')
      }
    } catch (error) {
      console.error('Error adding team:', error)
      setSnackbar({
        open: true,
        message: 'Error al agregar equipo',
        severity: 'error'
      })
    }
  }

  const handleRemoveTeam = async (teamId: string) => {
    try {
      if (!profile) return

      const response = await fetch(`/api/users/${profile.id}/teams/${teamId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSelectedTeams(selectedTeams.filter(id => id !== teamId))
        setSnackbar({
          open: true,
          message: 'Equipo removido exitosamente',
          severity: 'success'
        })
        // Recargar datos del perfil
        fetchProfileData()
      } else {
        throw new Error('Error al remover equipo')
      }
    } catch (error) {
      console.error('Error removing team:', error)
      setSnackbar({
        open: true,
        message: 'Error al remover equipo',
        severity: 'error'
      })
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
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        mb={{ xs: 2, sm: 3 }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 0 }}
      >
        <Typography 
          variant="h4"
          sx={{
            fontSize: { xs: '24px', sm: '28px', md: '34px' },
            lineHeight: { xs: '32px', sm: '36px', md: '40px' }
          }}
        >
          Mi Perfil
        </Typography>
        {!editMode ? (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEdit}
            sx={{
              borderRadius: { xs: '8px', sm: '12px' },
              textTransform: 'none',
              fontWeight: 600,
              px: { xs: '16px', sm: '24px' },
              py: { xs: '10px', sm: '12px' },
              fontSize: { xs: '13px', sm: '14px' },
              lineHeight: { xs: '18px', sm: '20px' },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Editar Perfil
          </Button>
        ) : (
          <Box display="flex" gap={{ xs: 1, sm: 1 }} flexDirection={{ xs: 'column', sm: 'row' }} width={{ xs: '100%', sm: 'auto' }}>
            <Button
              variant="outlined"
              startIcon={<Close />}
              onClick={handleCancel}
              disabled={saving}
              sx={{
                borderRadius: { xs: '8px', sm: '12px' },
                textTransform: 'none',
                fontWeight: 600,
                px: { xs: '16px', sm: '24px' },
                py: { xs: '10px', sm: '12px' },
                fontSize: { xs: '13px', sm: '14px' },
                lineHeight: { xs: '18px', sm: '20px' },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              startIcon={<Check />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                borderRadius: { xs: '8px', sm: '12px' },
                textTransform: 'none',
                fontWeight: 600,
                px: { xs: '16px', sm: '24px' },
                py: { xs: '10px', sm: '12px' },
                fontSize: { xs: '13px', sm: '14px' },
                lineHeight: { xs: '18px', sm: '20px' },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Información del Perfil */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 },
            borderRadius: { xs: '12px', sm: '16px' }
          }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={{ xs: 1.5, sm: 2 }}>
              <Avatar
                sx={{ 
                  width: { xs: 80, sm: 100 }, 
                  height: { xs: 80, sm: 100 }, 
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
              >
                {profile.name.charAt(0)}
              </Avatar>
              
              {editMode ? (
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    size="small"
                    sx={{
                      '& .MuiInputBase-root': {
                        height: { xs: '48px', sm: '56px' }
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    size="small"
                    sx={{
                      '& .MuiInputBase-root': {
                        height: { xs: '48px', sm: '56px' }
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Nueva contraseña"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    size="small"
                    autoComplete="new-password"
                    helperText="Déjalo vacío si no quieres cambiarla"
                    sx={{
                      '& .MuiInputBase-root': {
                        height: { xs: '48px', sm: '56px' }
                      }
                    }}
                  />
                  <FormControl fullWidth size="small">
                    <InputLabel>Equipo Principal</InputLabel>
                    <Select
                      value={formData.teamId}
                      onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                      label="Equipo Principal"
                      sx={{
                        '& .MuiInputBase-root': {
                          height: { xs: '48px', sm: '56px' }
                        }
                      }}
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
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '16px', sm: '20px' },
                      textAlign: 'center'
                    }}
                  >
                    {profile.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '13px', sm: '14px' },
                      textAlign: 'center'
                    }}
                  >
                    {profile.email}
                  </Typography>
                  <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap" mb={1}>
                    <Chip
                      label={getRoleLabel(profile.role)}
                      color={getRoleColor(profile.role)}
                      size="small"
                      sx={{ 
                        fontSize: { xs: '10px', sm: '12px' },
                        height: { xs: '20px', sm: '24px' }
                      }}
                    />
                    {profile.team && (
                      <Chip
                        label={profile.team.name}
                        size="small"
                        sx={{ 
                          fontSize: { xs: '10px', sm: '12px' },
                          height: { xs: '20px', sm: '24px' }
                        }}
                      />
                    )}
                  </Box>
                  
                  {/* Mostrar múltiples equipos */}
                  {profile.teams && profile.teams.length > 0 && (
                    <Box mt={1}>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '10px', sm: '11px' },
                          display: 'block',
                          textAlign: 'center',
                          mb: 0.5
                        }}
                      >
                        Equipos:
                      </Typography>
                      <Box display="flex" justifyContent="center" gap={0.5} flexWrap="wrap">
                        {profile.teams.map((team) => (
                          <Chip
                            key={team.id}
                            label={team.name}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontSize: { xs: '9px', sm: '10px' },
                              height: { xs: '18px', sm: '20px' }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    display="block" 
                    mt={1}
                    sx={{ 
                      fontSize: { xs: '11px', sm: '12px' },
                      textAlign: 'center'
                    }}
                  >
                    Miembro desde: {dayjs(profile.createdAt).format('DD/MM/YYYY')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Gestión de Equipos */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 },
            borderRadius: { xs: '12px', sm: '16px' }
          }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '16px', sm: '20px' },
                mb: { xs: 1, sm: 2 }
              }}
            >
              Mis Equipos
            </Typography>
            
            {editMode ? (
              <Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '12px', sm: '13px' },
                    mb: 2
                  }}
                >
                  Selecciona los equipos a los que perteneces:
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {teams.map((team) => (
                    <Box 
                      key={team.id} 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="space-between"
                      p={1}
                      sx={{ 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        bgcolor: selectedTeams.includes(team.id) ? '#f5f5f5' : 'transparent'
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: { xs: '13px', sm: '14px' }, fontWeight: 600 }}>
                          {team.name}
                        </Typography>
                        {team.description && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '11px', sm: '12px' } }}
                          >
                            {team.description}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (selectedTeams.includes(team.id)) {
                            setSelectedTeams(selectedTeams.filter(id => id !== team.id))
                          } else {
                            setSelectedTeams([...selectedTeams, team.id])
                          }
                        }}
                        sx={{ 
                          color: selectedTeams.includes(team.id) ? 'error.main' : 'primary.main'
                        }}
                      >
                        {selectedTeams.includes(team.id) ? <Delete /> : <Add />}
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box>
                {profile.teams && profile.teams.length > 0 ? (
                  <List>
                    {profile.teams.map((team, index) => (
                      <Box key={team.id}>
                        <ListItem sx={{ py: { xs: 1, sm: 1.5 } }}>
                          <ListItemIcon>
                            <Business sx={{ fontSize: { xs: 18, sm: 20 } }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box>
                                <Typography sx={{ fontSize: { xs: '13px', sm: '14px' }, fontWeight: 600 }}>
                                  {team.name}
                                </Typography>
                                {team.description && (
                                  <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: '11px', sm: '12px' } }}
                                  >
                                    {team.description}
                                  </Typography>
                                )}
                              </Box>
                            }
                            secondary={
                              <Box mt={1}>
                                {/* Líder del equipo */}
                                {team.leader && (
                                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                    <Chip
                                      label="Líder"
                                      size="small"
                                      color="primary"
                                      sx={{ 
                                        fontSize: { xs: '9px', sm: '10px' },
                                        height: { xs: '16px', sm: '18px' }
                                      }}
                                    />
                                    <Typography 
                                      variant="caption" 
                                      sx={{ fontSize: { xs: '10px', sm: '11px' } }}
                                    >
                                      {team.leader.name}
                                    </Typography>
                                  </Box>
                                )}
                                
                                {/* Miembros del equipo */}
                                {team.members && team.members.length > 0 && (
                                  <Box>
                                    <Typography 
                                      variant="caption" 
                                      color="text.secondary"
                                      sx={{ 
                                        fontSize: { xs: '9px', sm: '10px' },
                                        display: 'block',
                                        mb: 0.5
                                      }}
                                    >
                                      Miembros ({team.members.length}):
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                                      {team.members.map((member) => (
                                        <Chip
                                          key={member.id}
                                          label={member.name}
                                          size="small"
                                          variant="outlined"
                                          sx={{ 
                                            fontSize: { xs: '8px', sm: '9px' },
                                            height: { xs: '16px', sm: '18px' }
                                          }}
                                        />
                                      ))}
                                    </Box>
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < profile.teams!.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                ) : (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '13px', sm: '14px' },
                      textAlign: 'center',
                      py: { xs: 2, sm: 3 }
                    }}
                  >
                    No perteneces a ningún equipo
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Historial de Reservas */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 },
            borderRadius: { xs: '12px', sm: '16px' }
          }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '16px', sm: '20px' },
                mb: { xs: 1, sm: 2 }
              }}
            >
              Historial de Reservas
            </Typography>
            
            {reservations.length === 0 ? (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '13px', sm: '14px' },
                  textAlign: 'center',
                  py: { xs: 2, sm: 3 }
                }}
              >
                No tienes reservas registradas
              </Typography>
            ) : (
              <List>
                {reservations.map((reservation, index) => (
                  <Box key={reservation.id}>
                    <ListItem sx={{ py: { xs: 1, sm: 1.5 } }}>
                      <ListItemIcon>
                        <CalendarToday sx={{ fontSize: { xs: 18, sm: 20 } }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontSize: { xs: '13px', sm: '14px' } }}>
                            {dayjs(reservation.date).format('dddd, DD/MM/YYYY')}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ fontSize: { xs: '11px', sm: '12px' } }}>
                            {reservation.team ? `Equipo: ${reservation.team.name}` : 'Sin equipo'}
                          </Typography>
                        }
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
          <Paper sx={{ 
            p: { xs: 2, sm: 3 },
            borderRadius: { xs: '12px', sm: '16px' }
          }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '16px', sm: '20px' },
                mb: { xs: 1, sm: 2 }
              }}
            >
              Estadísticas
            </Typography>
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderRadius: { xs: '8px', sm: '12px' } }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography 
                      variant="h4" 
                      color="primary"
                      sx={{ 
                        fontSize: { xs: '24px', sm: '34px' },
                        mb: { xs: 0.5, sm: 1 }
                      }}
                    >
                      {reservations.length}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '12px', sm: '14px' } }}
                    >
                      Reservas Totales
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderRadius: { xs: '8px', sm: '12px' } }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography 
                      variant="h4" 
                      color="primary"
                      sx={{ 
                        fontSize: { xs: '24px', sm: '34px' },
                        mb: { xs: 0.5, sm: 1 }
                      }}
                    >
                      {reservations.filter(r => dayjs(r.date).isAfter(dayjs())).length}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '12px', sm: '14px' } }}
                    >
                      Reservas Futuras
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderRadius: { xs: '8px', sm: '12px' } }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography 
                      variant="h4" 
                      color="primary"
                      sx={{ 
                        fontSize: { xs: '24px', sm: '34px' },
                        mb: { xs: 0.5, sm: 1 }
                      }}
                    >
                      {profile.teams?.length || 0}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '12px', sm: '14px' } }}
                    >
                      Equipos
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