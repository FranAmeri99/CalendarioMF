'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Container, Typography, Box, CircularProgress } from '@mui/material'
import UnifiedCalendar from '@/components/Calendar/UnifiedCalendar'
import type { ReservationWithUser } from '@/types'

interface MeetingRoom {
  id: string
  name: string
  description?: string
  capacity: number
  isActive: boolean
}

interface MeetingRoomBooking {
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

export default function UnifiedCalendarPage() {
  const { data: session } = useSession()
  const [reservations, setReservations] = useState<ReservationWithUser[]>([])
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([])
  const [meetingRoomBookings, setMeetingRoomBookings] = useState<MeetingRoomBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [maxSpotsPerDay, setMaxSpotsPerDay] = useState(12)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Obtener todos los datos en paralelo
      const [calendarResponse, roomsResponse, bookingsResponse] = await Promise.all([
        fetch('/api/calendar'),
        fetch('/api/meeting-rooms'),
        fetch('/api/meeting-room-bookings')
      ])

      if (calendarResponse.ok) {
        const calendarData = await calendarResponse.json()
        setReservations(calendarData.reservations || [])
        if (calendarData.config?.maxSpotsPerDay) {
          setMaxSpotsPerDay(calendarData.config.maxSpotsPerDay)
        }
      }

      if (roomsResponse.ok) {
        const rooms = await roomsResponse.json()
        setMeetingRooms(rooms)
      }

      if (bookingsResponse.ok) {
        const bookings = await bookingsResponse.json()
        setMeetingRoomBookings(bookings)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDayClick = (date: Date) => {
    // Aquí puedes implementar la lógica para crear reservas
    console.log('Día seleccionado:', date)
  }

  const handleReservationClick = (reservation: ReservationWithUser) => {
    // Aquí puedes implementar la lógica para editar/eliminar reservas de asistencia
    console.log('Reserva de asistencia seleccionada:', reservation)
  }

  const handleMeetingRoomBookingClick = (booking: MeetingRoomBooking) => {
    // Aquí puedes implementar la lógica para editar/eliminar reservas de salas
    console.log('Reserva de sala seleccionada:', booking)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!session) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h4">Debes iniciar sesión para acceder a esta página.</Typography>
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 700,
          color: '#1a1a1a',
          fontSize: '32px',
          lineHeight: '40px',
          mb: 4,
          textAlign: 'center'
        }}
      >
        Calendario Unificado
      </Typography>
      
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          mb: 4,
          textAlign: 'center'
        }}
      >
        Visualiza y gestiona tanto las reservas de asistencia como las reservas de salas de reuniones en un solo lugar.
      </Typography>

      <UnifiedCalendar
        reservations={reservations}
        meetingRooms={meetingRooms}
        meetingRoomBookings={meetingRoomBookings}
        onDayClick={handleDayClick}
        onReservationClick={handleReservationClick}
        onMeetingRoomBookingClick={handleMeetingRoomBookingClick}
        maxSpotsPerDay={maxSpotsPerDay}
      />
    </Container>
  )
} 