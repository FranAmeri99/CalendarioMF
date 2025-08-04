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
import type { ReservationWithUser, DashboardStats } from '@/types'

// Datos mock para demostración
const mockReservations: ReservationWithUser[] = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    userId: '1',
    teamId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '1',
      email: 'juan.perez@empresa.com',
      name: 'Juan Pérez',
      role: 'USER',
      teamId: '1',
      avatar: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    team: {
      id: '1',
      name: 'Desarrollo',
      description: 'Equipo de desarrollo',
      leaderId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },
  {
    id: '2',
    date: new Date('2024-01-15'),
    userId: '2',
    teamId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '2',
      email: 'maria.garcia@empresa.com',
      name: 'María García',
      role: 'MANAGER',
      teamId: '1',
      avatar: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    team: {
      id: '1',
      name: 'Desarrollo',
      description: 'Equipo de desarrollo',
      leaderId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },
  {
    id: '3',
    date: new Date('2024-01-16'),
    userId: '3',
    teamId: '2',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '3',
      email: 'carlos.lopez@empresa.com',
      name: 'Carlos López',
      role: 'USER',
      teamId: '2',
      avatar: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    team: {
      id: '2',
      name: 'Diseño',
      description: 'Equipo de diseño',
      leaderId: '3',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },
  {
    id: '4',
    date: new Date('2024-01-17'),
    userId: '4',
    teamId: '2',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '4',
      email: 'ana.martinez@empresa.com',
      name: 'Ana Martínez',
      role: 'USER',
      teamId: '2',
      avatar: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    team: {
      id: '2',
      name: 'Diseño',
      description: 'Equipo de diseño',
      leaderId: '3',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },
  {
    id: '5',
    date: new Date('2024-01-18'),
    userId: '5',
    teamId: '3',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '5',
      email: 'pedro.rodriguez@empresa.com',
      name: 'Pedro Rodríguez',
      role: 'ADMIN',
      teamId: '3',
      avatar: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    team: {
      id: '3',
      name: 'Marketing',
      description: 'Equipo de marketing',
      leaderId: '5',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },
  // Agregar más reservas para mostrar diferentes estados
  {
    id: '6',
    date: new Date('2024-01-19'),
    userId: '6',
    teamId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '6',
      email: 'lucia.fernandez@empresa.com',
      name: 'Lucía Fernández',
      role: 'USER',
      teamId: '1',
      avatar: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    team: {
      id: '1',
      name: 'Desarrollo',
      description: 'Equipo de desarrollo',
      leaderId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },
  {
    id: '7',
    date: new Date('2024-01-19'),
    userId: '7',
    teamId: '2',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '7',
      email: 'diego.silva@empresa.com',
      name: 'Diego Silva',
      role: 'USER',
      teamId: '2',
      avatar: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    team: {
      id: '2',
      name: 'Diseño',
      description: 'Equipo de diseño',
      leaderId: '3',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },
  {
    id: '8',
    date: new Date('2024-01-19'),
    userId: '8',
    teamId: '3',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '8',
      email: 'sofia.morales@empresa.com',
      name: 'Sofía Morales',
      role: 'USER',
      teamId: '3',
      avatar: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    team: {
      id: '3',
      name: 'Marketing',
      description: 'Equipo de marketing',
      leaderId: '5',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },
]

const mockStats: DashboardStats = {
  totalUsers: 25,
  totalTeams: 4,
  totalReservations: 8,
  availableSpots: 88,
  reservedSpots: 8,
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reservations, setReservations] = useState<ReservationWithUser[]>(mockReservations)
  const [stats, setStats] = useState<DashboardStats>(mockStats)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

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