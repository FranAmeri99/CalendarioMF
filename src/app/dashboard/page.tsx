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

interface Booking {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  userId: string
  meetingRoomId: string
  user: {
    id: string
    name: string
    email: string
  }
  meetingRoom: {
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
  const [bookings, setBookings] = useState<Booking[]>([])
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
      
      // Cargar datos de stats y bookings en paralelo
      const [statsResponse, bookingsResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/meeting-room-bookings')
      ])
      
      if (!statsResponse.ok) {
        throw new Error(`HTTP error! status: ${statsResponse.status}`)
      }
      
      const statsData = await statsResponse.json()
      
      if (statsData.error) {
        throw new Error(statsData.error)
      }

      setStats(statsData.stats)
      setReservations(statsData.reservations)
      setTeams(statsData.teams)

      // Cargar bookings
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        setBookings(bookingsData)
      }
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
            icon={<Check />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <MetricCard
            title="Total Empleados"
            value={stats.totalUsers}
            subtitle={`${stats.totalTeams} equipos activos`}
            icon={<Warning />}
            color="success"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <MetricCard
            title="Mis Reservas"
            value={
              reservations.filter(r => {
                const isMyReservation = r.userId === session.user?.id
                const isFuture = new Date(r.date) > new Date()
                return isMyReservation && isFuture
              }).length +
              bookings.filter(b => {
                const isMyBooking = b.userId === session.user?.id
                const isFuture = new Date(b.startTime) > new Date()
                return isMyBooking && isFuture
              }).length
            }
            subtitle="próximas reservas"
            icon={<LocationOn />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Secciones principales */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
        <Grid item xs={12} md={6}>
          <UpcomingReservations 
            reservations={reservations} 
            bookings={bookings}
            currentUserId={session.user?.id}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <WeeklyOccupation reservations={reservations} maxSpots={stats.maxSpots} />
        </Grid>
      </Grid>


    </Container>
  )
} 