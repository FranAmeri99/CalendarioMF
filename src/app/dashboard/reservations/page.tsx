'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  CalendarToday,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface Reservation {
  id: string
  date: string
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
}

interface Team {
  id: string
  name: string
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [formData, setFormData] = useState({
    date: new Date(),
    userId: '',
    teamId: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Aquí se harían las llamadas a la API
      // Por ahora usamos datos de ejemplo
      setReservations([
        {
          id: '1',
          date: '2024-01-15',
          user: { id: '1', name: 'Juan Pérez', email: 'juan@example.com' },
          team: { id: '1', name: 'Desarrollo' },
        },
        {
          id: '2',
          date: '2024-01-16',
          user: { id: '2', name: 'María García', email: 'maria@example.com' },
          team: { id: '2', name: 'Diseño' },
        },
      ])

      setUsers([
        { id: '1', name: 'Juan Pérez', email: 'juan@example.com' },
        { id: '2', name: 'María García', email: 'maria@example.com' },
        { id: '3', name: 'Carlos López', email: 'carlos@example.com' },
      ])

      setTeams([
        { id: '1', name: 'Desarrollo' },
        { id: '2', name: 'Diseño' },
        { id: '3', name: 'Marketing' },
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (reservation?: Reservation) => {
    if (reservation) {
      setEditingReservation(reservation)
      setFormData({
        date: new Date(reservation.date),
        userId: reservation.user.id,
        teamId: reservation.team?.id || '',
      })
    } else {
      setEditingReservation(null)
      setFormData({
        date: new Date(),
        userId: '',
        teamId: '',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingReservation(null)
  }

  const handleSubmit = async () => {
    try {
      if (!formData.userId) {
        toast.error('Debe seleccionar un usuario')
        return
      }

      // Aquí se haría la llamada a la API
      if (editingReservation) {
        // Actualizar reserva
        toast.success('Reserva actualizada exitosamente')
      } else {
        // Crear nueva reserva
        toast.success('Reserva creada exitosamente')
      }

      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error('Error saving reservation:', error)
      toast.error('Error al guardar la reserva')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta reserva?')) {
      return
    }

    try {
      // Aquí se haría la llamada a la API
      toast.success('Reserva eliminada exitosamente')
      fetchData()
    } catch (error) {
      console.error('Error deleting reservation:', error)
      toast.error('Error al eliminar la reserva')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Cargando reservas...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Gestión de Reservas
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Reserva
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Equipo</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    {format(new Date(reservation.date), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>{reservation.user.name}</TableCell>
                  <TableCell>
                    {reservation.team ? (
                      <Chip label={reservation.team.name} size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin equipo
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{reservation.user.email}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(reservation)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(reservation.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para crear/editar reserva */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingReservation ? 'Editar Reserva' : 'Nueva Reserva'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DatePicker
                label="Fecha"
                value={formData.date}
                onChange={(newValue) => setFormData({ ...formData, date: newValue || new Date() })}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Usuario</InputLabel>
                <Select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  label="Usuario"
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Equipo (Opcional)</InputLabel>
                <Select
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  label="Equipo (Opcional)"
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
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingReservation ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 