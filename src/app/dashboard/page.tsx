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
    maxSpots: 12,
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
      <Box mb="32px">
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            color: '#1a1a1a',
            mb: '8px',
            fontSize: '32px',
            lineHeight: '40px'
          }}
        >
          Dashboard
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '24px'
          }}
        >
          Bienvenido de vuelta, {session.user?.name}
        </Typography>
      </Box>

      {/* Métricas principales */}
      <Grid container spacing="24px" mb="32px">
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Ocupación Hoy"
            value={`${stats.reservedSpots}/${stats.maxSpots}`}
            subtitle={`${stats.availableSpots} lugares disponibles`}
            icon={<LocationOn />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Promedio Semanal"
            value={`${Math.round((stats.reservedSpots / stats.maxSpots) * 100)}%`}
            subtitle="de ocupación"
            icon={<Business />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Empleados"
            value={stats.totalUsers}
            subtitle={`${stats.totalTeams} equipos activos`}
            icon={<People />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Mis Reservas"
            value={reservations.filter(r => r.userId === session.user?.id).length}
            subtitle="próximas reservas"
            icon={<CalendarToday />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Secciones principales */}
      <Grid container spacing="24px">
        <Grid item xs={12} md={6}>
          <UpcomingReservations reservations={reservations} />
        </Grid>
        <Grid item xs={12} md={6}>
          <WeeklyOccupation reservations={reservations} maxSpots={stats.maxSpots} />
        </Grid>
      </Grid>

      {/* Acciones rápidas */}
      <Box mt="32px">
        <Paper
          sx={{
            p: '24px',
            background: '#ffffff',
            border: '1px solid #e8e8e8',
            borderRadius: '16px',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: '16px',
              fontSize: '18px',
              lineHeight: '24px',
              color: '#1a1a1a'
            }}
          >
            Acciones Rápidas
          </Typography>
          <Box display="flex" gap="16px" flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<CalendarToday />}
              onClick={() => router.push('/dashboard/reservations')}
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
            <Button
              variant="outlined"
              startIcon={<Business />}
              onClick={() => router.push('/dashboard/teams')}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: '24px',
                py: '12px',
                fontSize: '14px',
                lineHeight: '20px',
                borderColor: '#e0e0e0',
                color: '#1a1a1a',
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
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: '24px',
                py: '12px',
                fontSize: '14px',
                lineHeight: '20px',
                borderColor: '#e0e0e0',
                color: '#1a1a1a',
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