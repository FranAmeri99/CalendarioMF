'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Paper,
  Grid,
  Typography,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Badge,
  Tabs,
  Tab,
} from '@mui/material'
import {
  CalendarToday,
  People,
  Warning,
  Info,
  MeetingRoom,
  Person,
} from '@mui/icons-material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import type { ReservationWithUser } from '@/types'

// Configurar dayjs con locale español
dayjs.locale('es')

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

interface UnifiedCalendarProps {
  reservations: ReservationWithUser[]
  meetingRooms: MeetingRoom[]
  meetingRoomBookings: MeetingRoomBooking[]
  onDayClick?: (date: Date) => void
  onReservationClick?: (reservation: ReservationWithUser) => void
  onMeetingRoomBookingClick?: (booking: MeetingRoomBooking) => void
  maxSpotsPerDay?: number
  config?: {
    maxSpotsPerDay: number
    allowWeekendReservations: boolean
    allowHolidayReservations: boolean
  }
}

export default function UnifiedCalendar({
  reservations,
  meetingRooms,
  meetingRoomBookings,
  onDayClick,
  onReservationClick,
  onMeetingRoomBookingClick,
  maxSpotsPerDay = 12
}: UnifiedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  // Generar días del mes actual
  const calendarDays = useMemo(() => {
    const start = dayjs(currentDate).startOf('month').startOf('week')
    const end = dayjs(currentDate).endOf('month').endOf('week')
    const days: Date[] = []
    let currentDay = start
    while (currentDay.isBefore(end) || currentDay.isSame(end, 'day')) {
      days.push(currentDay.toDate())
      currentDay = currentDay.add(1, 'day')
    }
    return days
  }, [currentDate])

  // Obtener reservas de asistencia para una fecha específica
  const getAttendanceReservationsForDate = (date: Date) => {
    return reservations.filter(reservation => 
      dayjs(new Date(reservation.date)).isSame(date, 'day')
    )
  }

  // Obtener reservas de salas de reuniones para una fecha específica
  const getMeetingRoomBookingsForDate = (date: Date) => {
    return meetingRoomBookings.filter(booking => {
      const bookingDate = dayjs(new Date(booking.startTime))
      return bookingDate.isSame(date, 'day')
    })
  }

  // Calcular estadísticas del día para asistencia
  const getAttendanceDayStats = (date: Date) => {
    const dayReservations = getAttendanceReservationsForDate(date)
    const reservedSpots = dayReservations.length
    const availableSpots = maxSpotsPerDay - reservedSpots
    const isFull = reservedSpots >= maxSpotsPerDay

    return {
      reservedSpots,
      availableSpots,
      isFull,
      reservations: dayReservations
    }
  }

  // Calcular estadísticas del día para salas de reuniones
  const getMeetingRoomDayStats = (date: Date) => {
    const dayBookings = getMeetingRoomBookingsForDate(date)
    const totalRooms = meetingRooms.filter(room => room.isActive).length
    const occupiedRooms = dayBookings.length
    const availableRooms = totalRooms - occupiedRooms

    return {
      occupiedRooms,
      availableRooms,
      totalRooms,
      bookings: dayBookings
    }
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setDialogOpen(true)
    onDayClick?.(date)
  }

  const handlePreviousMonth = () => {
    setCurrentDate(dayjs(currentDate).subtract(1, 'month').toDate())
  }

  const handleNextMonth = () => {
    setCurrentDate(dayjs(currentDate).add(1, 'month').toDate())
  }

  const handleReservationClick = (reservation: ReservationWithUser) => {
    onReservationClick?.(reservation)
  }

  const handleMeetingRoomBookingClick = (booking: MeetingRoomBooking) => {
    onMeetingRoomBookingClick?.(booking)
  }

  const getDayColor = (date: Date) => {
    const attendanceStats = getAttendanceDayStats(date)
    const meetingRoomStats = getMeetingRoomDayStats(date)
    const isToday = dayjs(date).isSame(dayjs(), 'day')
    const isCurrentMonth = dayjs(date).isSame(dayjs(currentDate), 'month')

    if (!isCurrentMonth) return 'grey.300'
    if (isToday) return 'primary.light'
    if (attendanceStats.isFull && meetingRoomStats.occupiedRooms > 0) return 'error.light'
    if (attendanceStats.reservedSpots > 0 || meetingRoomStats.occupiedRooms > 0) return 'warning.light'
    return 'background.paper'
  }

  const getDayTextColor = (date: Date) => {
    const isToday = dayjs(date).isSame(dayjs(), 'day')
    const isCurrentMonth = dayjs(date).isSame(dayjs(currentDate), 'month')

    if (!isCurrentMonth) return 'text.disabled'
    if (isToday) return 'primary.contrastText'
    return 'text.primary'
  }

  const getRoomColor = (roomId: string) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
    const roomIndex = meetingRooms.findIndex(room => room.id === roomId)
    return colors[roomIndex % colors.length]
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {/* Header del calendario */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <IconButton onClick={handlePreviousMonth}>
          <ChevronLeftIcon />
        </IconButton>
        
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          {dayjs(currentDate).format('MMMM YYYY')}
        </Typography>
        
        <IconButton onClick={handleNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Días de la semana */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <Grid item xs key={day}>
            <Typography
              variant="subtitle2"
              align="center"
              sx={{ fontWeight: 'bold', color: 'text.secondary' }}
            >
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Días del calendario */}
      <Grid container spacing={1}>
        {calendarDays.map((day) => {
          const attendanceStats = getAttendanceDayStats(day)
          const meetingRoomStats = getMeetingRoomDayStats(day)
          const isToday = dayjs(day).isSame(dayjs(), 'day')
          
          return (
            <Grid item xs key={day.toISOString()}>
              <Paper
                elevation={isToday ? 4 : 1}
                sx={{
                  p: 1,
                  minHeight: 100,
                  cursor: 'pointer',
                  backgroundColor: getDayColor(day),
                  color: getDayTextColor(day),
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'scale(1.02)',
                    transition: 'all 0.2s ease-in-out'
                  },
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                  border: isToday ? 2 : 0,
                  borderColor: 'primary.main'
                }}
                onClick={() => handleDayClick(day)}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Número del día */}
                  <Typography
                    variant="body2"
                    align="center"
                    sx={{
                      fontWeight: isToday ? 'bold' : 'normal',
                      fontSize: '0.875rem'
                    }}
                  >
                    {dayjs(day).format('D')}
                  </Typography>

                  {/* Indicadores de reservas */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                    {/* Indicador de asistencia */}
                    {attendanceStats.reservedSpots > 0 && (
                      <Chip
                        icon={<Person />}
                        label={`${attendanceStats.reservedSpots}/${maxSpotsPerDay}`}
                        size="small"
                        color={attendanceStats.isFull ? "error" : "warning"}
                        sx={{ fontSize: '0.6rem', height: 16 }}
                      />
                    )}
                    
                    {/* Indicador de salas de reuniones */}
                    {meetingRoomStats.occupiedRooms > 0 && (
                      <Chip
                        icon={<MeetingRoom />}
                        label={`${meetingRoomStats.occupiedRooms}/${meetingRoomStats.totalRooms}`}
                        size="small"
                        color="info"
                        sx={{ fontSize: '0.6rem', height: 16 }}
                      />
                    )}

                    {/* Indicador de día disponible */}
                    {attendanceStats.reservedSpots === 0 && meetingRoomStats.occupiedRooms === 0 && (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Disponible"
                        size="small"
                        color="success"
                        sx={{ fontSize: '0.6rem', height: 16 }}
                      />
                    )}
                  </Box>

                  {/* Badge para múltiples eventos */}
                  {(attendanceStats.reservations.length + meetingRoomStats.bookings.length) > 3 && (
                    <Badge
                      badgeContent={attendanceStats.reservations.length + meetingRoomStats.bookings.length}
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        '& .MuiBadge-badge': {
                          fontSize: '0.6rem',
                          height: 16,
                          minWidth: 16
                        }
                      }}
                    />
                  )}
                </Box>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      {/* Leyenda */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Chip icon={<CheckCircleIcon />} label="Disponible" color="success" size="small" />
        <Chip icon={<Person />} label="Asistencia" color="warning" size="small" />
        <Chip icon={<MeetingRoom />} label="Salas" color="info" size="small" />
        <Chip icon={<Warning />} label="Completo" color="error" size="small" />
        <Chip icon={<Info />} label="Hoy" color="primary" size="small" />
      </Box>

      {/* Dialog con detalles del día */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday />
            <Typography>
              {selectedDate && dayjs(selectedDate).format('EEEE, D [de] MMMM [de] YYYY')}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedDate && (() => {
            const attendanceStats = getAttendanceDayStats(selectedDate)
            const meetingRoomStats = getMeetingRoomDayStats(selectedDate)
            
            return (
              <Box>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                  <Tab 
                    icon={<Person />} 
                    label={`Asistencia (${attendanceStats.reservedSpots}/${maxSpotsPerDay})`} 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<MeetingRoom />} 
                    label={`Salas (${meetingRoomStats.occupiedRooms}/${meetingRoomStats.totalRooms})`} 
                    iconPosition="start"
                  />
                </Tabs>

                {activeTab === 0 && (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Estado de Asistencia
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<Person />}
                          label={`Reservados: ${attendanceStats.reservedSpots}`}
                          color="warning"
                        />
                        <Chip
                          icon={<CheckCircleIcon />}
                          label={`Disponibles: ${attendanceStats.availableSpots}`}
                          color="success"
                        />
                        {attendanceStats.isFull && (
                          <Chip
                            icon={<Warning />}
                            label="Día completo"
                            color="error"
                          />
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" gutterBottom>
                      Reservas de Asistencia
                    </Typography>
                    
                    {attendanceStats.reservations.length > 0 ? (
                      <List>
                        {attendanceStats.reservations.map((reservation) => (
                          <ListItem
                            key={reservation.id}
                            button
                            onClick={() => handleReservationClick(reservation)}
                            sx={{ borderRadius: 1, mb: 1 }}
                          >
                            <ListItemAvatar>
                              <Avatar>
                                {reservation.user.name.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={reservation.user.name}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {reservation.user.email}
                                  </Typography>
                                  {reservation.team && (
                                    <Chip
                                      label={reservation.team.name}
                                      size="small"
                                      color="primary"
                                      sx={{ mt: 0.5 }}
                                    />
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                        No hay reservas de asistencia para este día
                      </Typography>
                    )}
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Estado de Salas de Reuniones
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<MeetingRoom />}
                          label={`Ocupadas: ${meetingRoomStats.occupiedRooms}`}
                          color="info"
                        />
                        <Chip
                          icon={<CheckCircleIcon />}
                          label={`Disponibles: ${meetingRoomStats.availableRooms}`}
                          color="success"
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" gutterBottom>
                      Reservas de Salas
                    </Typography>
                    
                    {meetingRoomStats.bookings.length > 0 ? (
                      <List>
                        {meetingRoomStats.bookings.map((booking) => (
                          <ListItem
                            key={booking.id}
                            button
                            onClick={() => handleMeetingRoomBookingClick(booking)}
                            sx={{ 
                              borderRadius: 1, 
                              mb: 1,
                              borderLeft: `4px solid ${getRoomColor(booking.meetingRoomId)}`
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar>
                                {booking.user.name.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={booking.title}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {booking.user.name} - {booking.meetingRoom.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {dayjs(booking.startTime).format('HH:mm')} - {dayjs(booking.endTime).format('HH:mm')}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                        No hay reservas de salas para este día
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )
          })()}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cerrar
          </Button>
          {selectedDate && (() => {
            const attendanceStats = getAttendanceDayStats(selectedDate)
            const meetingRoomStats = getMeetingRoomDayStats(selectedDate)
            return !attendanceStats.isFull || meetingRoomStats.availableRooms > 0 ? (
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  setDialogOpen(false)
                  onDayClick?.(selectedDate)
                }}
              >
                Hacer Reserva
              </Button>
            ) : null
          })()}
        </DialogActions>
      </Dialog>
    </Paper>
  )
} 