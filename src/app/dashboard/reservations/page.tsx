'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Paper,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

// Configurar dayjs con locale español
dayjs.locale('es')
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday,
} from '@mui/icons-material'
import { ModernCalendarView } from '@/components/Calendar/ModernCalendarView'

interface Reservation {
  id: string
  date: string
  userId: string
  teamId?: string
  user: {
    id: string
    name: string
    email: string
  }
  team?: {
    id: string
    name: string
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  teamId?: string
}

interface Team {
  id: string
  name: string
  description?: string
}

interface FormData {
  date: Date | null
  userId: string
  teamId: string
}

export default function ReservationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [formData, setFormData] = useState<FormData>({
    date: null,
    userId: '',
    teamId: '',
  })
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reservations')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setReservations(data.reservations)
      setUsers(data.users)
      setTeams(data.teams)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (reservation?: Reservation) => {
    if (reservation) {
      setEditingReservation(reservation)
      setFormData({
        date: new Date(reservation.date),
        userId: reservation.userId,
        teamId: reservation.teamId || '',
      })
    } else {
      setEditingReservation(null)
      // Si es un usuario normal, usar su ID y equipo automáticamente
      const currentUserId = session?.user?.id
      const currentUser = users.find(u => u.id === currentUserId)
      
      setFormData({
        date: null,
        userId: currentUserId || '',
        teamId: currentUser?.teamId || '',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingReservation(null)
    setFormData({
      date: null,
      userId: '',
      teamId: '',
    })
  }

  const handleSubmit = async () => {
    try {
      if (!formData.userId || !formData.date) {
        alert('Debe seleccionar un usuario y una fecha')
        return
      }

      const url = editingReservation ? '/api/reservations' : '/api/reservations'
      const method = editingReservation ? 'PUT' : 'POST'
      
      const body = editingReservation 
        ? {
            id: editingReservation.id,
            date: formData.date.toISOString(),
            userId: formData.userId,
            teamId: formData.teamId || undefined,
          }
        : {
            date: formData.date.toISOString(),
            userId: formData.userId,
            teamId: formData.teamId || undefined,
          }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      alert(editingReservation ? 'Reserva actualizada exitosamente' : 'Reserva creada exitosamente')
      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error('Error saving reservation:', error)
      alert('Error al guardar la reserva')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta reserva?')) {
      return
    }

    try {
      const response = await fetch(`/api/reservations?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      alert('Reserva eliminada exitosamente')
      fetchData()
    } catch (error) {
      console.error('Error deleting reservation:', error)
      alert('Error al eliminar la reserva')
    }
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    handleOpenDialog()
    setFormData({
      date: date,
      userId: '',
      teamId: '',
    })
  }

  const handleViewModeChange = (event: React.SyntheticEvent, newValue: 'calendar' | 'list') => {
    setViewMode(newValue)
  }

  if (status === 'loading' || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!session) {
    return null
  }

  return (
    <Container maxWidth="xl" sx={{ p: 0 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="32px">
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            color: '#1a1a1a',
            fontSize: '32px',
            lineHeight: '40px'
          }}
        >
          Gestión de Reservas
        </Typography>
        <Box display="flex" gap="16px" alignItems="center">
          <Tabs
            value={viewMode}
            onChange={handleViewModeChange}
            sx={{
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: '16px',
                py: '8px',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '20px',
              }
            }}
          >
            <Tab
              value="calendar"
              label="Calendario"
            />
            <Tab
              value="list"
              label="Lista"
            />
          </Tabs>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: '24px',
              py: '12px',
              fontSize: '14px',
              lineHeight: '20px',
              bgcolor: '#1976d2',
              '&:hover': {
                bgcolor: '#1565c0'
              }
            }}
          >
            Nueva Reserva
          </Button>
        </Box>
      </Box>

      {/* Vista de Calendario */}
      {viewMode === 'calendar' && (
        <ModernCalendarView
          reservations={reservations}
          users={users}
          teams={teams}
          currentUser={session?.user as User}
          maxSpots={12}
          onCreateReservation={async (date: string) => {
            // Crear reserva automáticamente para el usuario actual
            const currentUserId = session?.user?.id
            const currentUser = users.find(u => u.id === currentUserId)
            
            try {
              const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  date: date,
                  userId: currentUserId,
                  teamId: currentUser?.teamId || undefined,
                }),
              })

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
              }

              const data = await response.json()
              
              if (data.error) {
                throw new Error(data.error)
              }

              alert('Reserva creada exitosamente')
              fetchData()
            } catch (error) {
              console.error('Error creating reservation:', error)
              alert('Error al crear la reserva')
            }
          }}
          onCancelReservation={async (reservationId: string) => {
            try {
              const response = await fetch(`/api/reservations?id=${reservationId}`, {
                method: 'DELETE',
              })

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
              }

              const data = await response.json()
              
              if (data.error) {
                throw new Error(data.error)
              }

              alert('Reserva cancelada exitosamente')
              fetchData()
            } catch (error) {
              console.error('Error canceling reservation:', error)
              alert('Error al cancelar la reserva')
            }
          }}
        />
      )}

      {/* Vista de Lista */}
      {viewMode === 'list' && (
        <Paper
          sx={{
            background: '#ffffff',
            border: '1px solid #e8e8e8',
            borderRadius: '16px',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#fafafa' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Usuario</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Equipo</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {reservation.user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {reservation.user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {reservation.team ? (
                        <Chip
                          label={reservation.team.name}
                          size="small"
                          sx={{
                            bgcolor: '#e3f2fd',
                            color: '#1976d2',
                            fontWeight: 600
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Sin equipo
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {dayjs(reservation.date).locale('es').format('dddd, D [de] MMMM [de] YYYY')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap="8px">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(reservation)}
                          sx={{ color: '#1976d2' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(reservation.id)}
                          sx={{ color: '#d32f2f' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Dialog para crear/editar reserva */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingReservation ? 'Editar Reserva' : 'Nueva Reserva'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap="16px" mt="8px">
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DatePicker
                label="Fecha"
                value={formData.date}
                onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small'
                  }
                }}
              />
            </LocalizationProvider>

            {/* Solo mostrar selector de usuario si es admin o si está editando una reserva */}
            {(session?.user?.role === 'ADMIN' || editingReservation) ? (
              <FormControl fullWidth size="small">
                <InputLabel>Usuario</InputLabel>
                <Select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  label="Usuario"
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                fullWidth
                size="small"
                label="Usuario"
                value={session?.user?.name || ''}
                disabled
                helperText="Tu reserva se creará automáticamente para tu usuario"
              />
            )}

            {/* Solo mostrar selector de equipo si es admin o si está editando una reserva de otro usuario */}
            {(session?.user?.role === 'ADMIN' || editingReservation) && (
              <FormControl fullWidth size="small">
                <InputLabel>Equipo (opcional)</InputLabel>
                <Select
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  label="Equipo (opcional)"
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
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingReservation ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
} 