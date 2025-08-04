'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  Button,
} from '@mui/material'
import {
  People,
  Business,
  CalendarToday,
  Check,
  Warning,
} from '@mui/icons-material'
import Navigation from '@/components/Layout/Navigation'
import InteractiveCalendar from '@/components/Calendar/InteractiveCalendar'
import CalendarStats from '@/components/Calendar/CalendarStats'
import { ReservationService } from '@/lib/services/reservationService'
import { UserService } from '@/lib/services/userService'
import { TeamService } from '@/lib/services/teamService'
import { ConfigService } from '@/lib/services/configService'
import type { ReservationWithUser } from '@/lib/services/reservationService'

interface DashboardStats {
  totalUsers: number
  totalTeams: number
  totalReservations: number
  availableSpots: number
  reservedSpots: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reservations, setReservations] = useState<ReservationWithUser[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTeams: 0,
    totalReservations: 0,
    availableSpots: 0,
    reservedSpots: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Cargar datos reales
  useEffect(() => {
    if (status === 'authenticated') {
      loadDashboardData()
    }
  }, [status])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [reservationsData, userStats, teamStats, reservationStats, config] = await Promise.all([
        ReservationService.getAllReservations(),
        UserService.getUserStats(),
        TeamService.getSimpleTeams(),
        ReservationService.getReservationStats(),
        ConfigService.getConfig(),
      ])

      setReservations(reservationsData)
      setStats({
        totalUsers: userStats.totalUsers,
        totalTeams: teamStats.length,
        totalReservations: reservationStats.totalReservations,
        availableSpots: config.maxSpotsPerDay - reservationStats.todayReservations,
        reservedSpots: reservationStats.todayReservations,
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDayClick = (date: Date) => {
    console.log('Día seleccionado:', date)
    // Aquí podrías navegar a la página de reservas con la fecha seleccionada
  }

  const handleReservationClick = (reservation: ReservationWithUser) => {
    console.log('Reserva seleccionada:', reservation)
    // Aquí podrías mostrar detalles de la reserva o editarla
  }

  if (status === 'loading') {
    return <div>Cargando...</div>
  }

  if (!session) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Dashboard
        </Typography>

        {/* Estadísticas rápidas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <People color="primary" />
                  <Box>
                    <Typography variant="h6">{stats.totalUsers}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Usuarios
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Business color="primary" />
                  <Box>
                    <Typography variant="h6">{stats.totalTeams}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Equipos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CalendarToday color="primary" />
                  <Box>
                    <Typography variant="h6">{stats.totalReservations}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reservas Activas
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Check color="primary" />
                  <Box>
                    <Typography variant="h6">{stats.availableSpots}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lugares Disponibles
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alertas */}
        <Box sx={{ mb: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Recordatorio:</strong> Solo hay 12 lugares disponibles por día en la oficina.
            </Typography>
          </Alert>
          
          {stats.reservedSpots > 10 && (
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Atención:</strong> Hay días con alta ocupación. Revisa el calendario para más detalles.
              </Typography>
            </Alert>
          )}
        </Box>

        {/* Calendario Interactivo */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
            Calendario de Reservas
          </Typography>
          <InteractiveCalendar
            reservations={reservations}
            onDayClick={handleDayClick}
            onReservationClick={handleReservationClick}
            maxSpotsPerDay={12}
          />
        </Box>

                 {/* Estadísticas del calendario */}
         <Box sx={{ mb: 4 }}>
           <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
             Estadísticas del Calendario
           </Typography>
           <CalendarStats reservations={reservations} maxSpotsPerDay={12} />
         </Box>

         {/* Acciones rápidas */}
         <Box>
           <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
             Acciones Rápidas
           </Typography>
           <Grid container spacing={2}>
             <Grid item>
               <Button
                 variant="contained"
                 startIcon={<CalendarToday />}
                 onClick={() => router.push('/dashboard/reservations')}
               >
                 Nueva Reserva
               </Button>
             </Grid>
             <Grid item>
               <Button
                 variant="outlined"
                 startIcon={<People />}
                 onClick={() => router.push('/dashboard/users')}
               >
                 Gestionar Usuarios
               </Button>
             </Grid>
             <Grid item>
               <Button
                 variant="outlined"
                 startIcon={<Business />}
                 onClick={() => router.push('/dashboard/teams')}
               >
                 Gestionar Equipos
               </Button>
             </Grid>
           </Grid>
         </Box>
      </Container>
    </Box>
  )
} 