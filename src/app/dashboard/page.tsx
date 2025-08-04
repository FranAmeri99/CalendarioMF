'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material'
import {
  People,
  Business,
  CalendarToday,
  Check,
  Warning,
} from '@mui/icons-material'
import { format, startOfWeek, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

interface DashboardStats {
  totalUsers: number
  totalTeams: number
  totalReservations: number
  availableSpots: number
  reservedSpots: number
}

interface Reservation {
  id: string
  date: string
  user: {
    name: string
    email: string
  }
  team?: {
    name: string
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTeams: 0,
    totalReservations: 0,
    availableSpots: 0,
    reservedSpots: 0,
  })
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Aquí se harían las llamadas a la API
      // Por ahora usamos datos de ejemplo
      setStats({
        totalUsers: 25,
        totalTeams: 5,
        totalReservations: 18,
        availableSpots: 6,
        reservedSpots: 6,
      })

      setReservations([
        {
          id: '1',
          date: '2024-01-15',
          user: { name: 'Juan Pérez', email: 'juan@example.com' },
          team: { name: 'Desarrollo' },
        },
        {
          id: '2',
          date: '2024-01-15',
          user: { name: 'María García', email: 'maria@example.com' },
          team: { name: 'Diseño' },
        },
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeekDays = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }

  const getDayStatus = (date: Date) => {
    const dayReservations = reservations.filter(
      (r) => r.date === format(date, 'yyyy-MM-dd')
    )
    const count = dayReservations.length
    const isFull = count >= 12

    return {
      count,
      isFull,
      available: 12 - count,
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Cargando dashboard...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <People color="primary" />
                <Box>
                  <Typography variant="h4">{stats.totalUsers}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usuarios
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Business color="primary" />
                <Box>
                  <Typography variant="h4">{stats.totalTeams}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Equipos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CalendarToday color="primary" />
                <Box>
                  <Typography variant="h4">{stats.totalReservations}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reservas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Check color="primary" />
                <Box>
                  <Typography variant="h4">{stats.availableSpots}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lugares Disponibles
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Calendario Semanal */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Calendario Semanal
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Día</TableCell>
                    <TableCell>Reservas</TableCell>
                    <TableCell>Disponibles</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getWeekDays().map((date) => {
                    const status = getDayStatus(date)
                    return (
                      <TableRow key={date.toISOString()}>
                        <TableCell>
                          <Typography variant="body2">
                            {format(date, 'EEEE', { locale: es })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(date, 'dd/MM/yyyy')}
                          </Typography>
                        </TableCell>
                        <TableCell>{status.count}/12</TableCell>
                        <TableCell>{status.available}</TableCell>
                        <TableCell>
                          {status.isFull ? (
                            <Chip
                              icon={<Warning />}
                              label="Completo"
                              color="error"
                              size="small"
                            />
                          ) : (
                            <Chip
                              icon={<Check />}
                              label="Disponible"
                              color="success"
                              size="small"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Reservas Recientes
            </Typography>
            {reservations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No hay reservas recientes
              </Typography>
            ) : (
              <Box>
                {reservations.slice(0, 5).map((reservation) => (
                  <Box key={reservation.id} sx={{ mb: 2, p: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" fontWeight="bold">
                      {reservation.user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {reservation.team?.name} • {format(new Date(reservation.date), 'dd/MM/yyyy')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Alertas */}
      {stats.reservedSpots >= 10 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          ¡Atención! La oficina está casi llena para hoy. Solo quedan {stats.availableSpots} lugares disponibles.
        </Alert>
      )}
    </Box>
  )
} 