'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material'
import {
  People,
  Business,
  CalendarToday,
  Check,
  Warning,
  LocationOn,
} from '@mui/icons-material'
import MetricCard from '@/components/Dashboard/MetricCard'
import UpcomingReservations from '@/components/Dashboard/UpcomingReservations'
import WeeklyOccupation from '@/components/Dashboard/WeeklyOccupation'

interface DashboardStats {
  totalUsers: number
  totalTeams: number
  totalReservations: number
  availableSpots: number
  reservedSpots: number
  maxSpots: number
  weeklyAverage: number
}

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

interface Team {
  id: string
  name: string
  description?: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTeams: 0,
    totalReservations: 0,
    availableSpots: 0,
    reservedSpots: 0,
    maxSpots: 19, // Valor por defecto que se actualizará con la configuración real
    weeklyAverage: 0,
  })
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      loadDashboardData()
    }
  }, [status])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/stats')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setStats(data.stats)
      setReservations(data.reservations)
      setTeams(data.teams)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
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
      {/* Header */}
      <Box mb={{ xs: '24px', sm: '32px' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            color: '#1a1a1a',
            mb: { xs: '4px', sm: '8px' },
            fontSize: { xs: '24px', sm: '28px', md: '32px' },
            lineHeight: { xs: '32px', sm: '36px', md: '40px' }
          }}
        >
          Dashboard
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            fontWeight: 400,
            fontSize: { xs: '14px', sm: '16px' },
            lineHeight: { xs: '20px', sm: '24px' }
          }}
        >
          Bienvenido de vuelta, {session.user?.name}
        </Typography>
      </Box>

      {/* Métricas principales */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 3 }} mb={{ xs: '24px', sm: '32px' }}>
        <Grid item xs={6} sm={6} md={3}>
          <MetricCard
            title="Ocupación Hoy"
            value={`${stats.reservedSpots}/${stats.maxSpots}`}
            subtitle={`${stats.availableSpots} lugares disponibles`}
            icon={<LocationOn />}
            color="primary"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <MetricCard
            title="Promedio Semanal"
            value={`${stats.weeklyAverage}%`}
            subtitle="de ocupación"
            icon={<Business />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <MetricCard
            title="Total Empleados"
            value={stats.totalUsers}
            subtitle={`${stats.totalTeams} equipos activos`}
            icon={<People />}
            color="success"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <MetricCard
            title="Mis Reservas"
            value={reservations.filter(r => {
              const isMyReservation = r.userId === session.user?.id
              const isFuture = new Date(r.date) > new Date()
              return isMyReservation && isFuture
            }).length}
            subtitle="próximas reservas"
            icon={<CalendarToday />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Secciones principales */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
        <Grid item xs={12} md={6}>
          <UpcomingReservations reservations={reservations} />
        </Grid>
        <Grid item xs={12} md={6}>
          <WeeklyOccupation reservations={reservations} maxSpots={stats.maxSpots} />
        </Grid>
      </Grid>

      {/* Acciones rápidas */}
      <Box mt={{ xs: '24px', sm: '32px' }}>
        <Paper
          sx={{
            p: { xs: '16px', sm: '24px' },
            background: '#ffffff',
            border: '1px solid #e8e8e8',
            borderRadius: { xs: '12px', sm: '16px' },
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: { xs: '12px', sm: '16px' },
              fontSize: { xs: '16px', sm: '18px' },
              lineHeight: { xs: '20px', sm: '24px' },
              color: '#1a1a1a'
            }}
          >
            Acciones Rápidas
          </Typography>
          <Box display="flex" gap={{ xs: '8px', sm: '16px' }} flexWrap="wrap" flexDirection={{ xs: 'column', sm: 'row' }}>
            <Button
              variant="contained"
              startIcon={<CalendarToday />}
              onClick={() => router.push('/dashboard/reservations')}
              sx={{
                borderRadius: { xs: '8px', sm: '12px' },
                textTransform: 'none',
                fontWeight: 600,
                px: { xs: '16px', sm: '24px' },
                py: { xs: '10px', sm: '12px' },
                fontSize: { xs: '13px', sm: '14px' },
                lineHeight: { xs: '18px', sm: '20px' },
                bgcolor: '#1976d2',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  bgcolor: '#1565c0'
                }
              }}
            >
              Nueva Reserva
            </Button>
            <Button
              variant="outlined"
              startIcon={<Business />}
              onClick={() => router.push('/dashboard/teams')}
              sx={{
                borderRadius: { xs: '8px', sm: '12px' },
                textTransform: 'none',
                fontWeight: 600,
                px: { xs: '16px', sm: '24px' },
                py: { xs: '10px', sm: '12px' },
                fontSize: { xs: '13px', sm: '14px' },
                lineHeight: { xs: '18px', sm: '20px' },
                borderColor: '#e0e0e0',
                color: '#1a1a1a',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  borderColor: '#1976d2',
                  bgcolor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              Ver Equipos
            </Button>
            <Button
              variant="outlined"
              startIcon={<People />}
              onClick={() => router.push('/dashboard/users')}
              sx={{
                borderRadius: { xs: '8px', sm: '12px' },
                textTransform: 'none',
                fontWeight: 600,
                px: { xs: '16px', sm: '24px' },
                py: { xs: '10px', sm: '12px' },
                fontSize: { xs: '13px', sm: '14px' },
                lineHeight: { xs: '18px', sm: '20px' },
                borderColor: '#e0e0e0',
                color: '#1a1a1a',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  borderColor: '#1976d2',
                  bgcolor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              Gestionar Usuarios
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
} 