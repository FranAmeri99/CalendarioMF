'use client'

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Tooltip,
  IconButton,
  Grid,
} from '@mui/material'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  LocationOn,
  Close as CancelIcon,
  Add as Plus,
} from '@mui/icons-material'

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

interface UntitledCalendarProps {
  reservations: Reservation[]
  users: User[]
  teams: Team[]
  currentUser: User | null
  maxSpots: number
  onCreateReservation: (date: string) => Promise<void>
  onCancelReservation: (reservationId: string) => Promise<void>
}

export default function UntitledCalendar({
  reservations,
  users,
  teams,
  currentUser,
  maxSpots,
  onCreateReservation,
  onCancelReservation,
}: UntitledCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const getDayReservations = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return reservations.filter((r) => r.date.split('T')[0] === dateStr)
  }

  const getDayOccupancy = (date: Date) => {
    const dayReservations = getDayReservations(date)
    return {
      availableSpots: maxSpots - dayReservations.length,
      reservations: dayReservations,
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setDialogOpen(true)
  }

  const handleReservation = async (date: Date) => {
    if (onCreateReservation) {
      await onCreateReservation(format(date, 'yyyy-MM-dd'))
      setDialogOpen(false)
      setSelectedDate(null)
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    if (onCancelReservation) {
      await onCancelReservation(reservationId)
      setDialogOpen(false)
    }
  }

  const getTeamColor = (teamId: string | null | undefined) => {
    if (!teamId) return '#6b7280'
    const team = (teams ?? []).find((t) => t.id === teamId)
    return team ? '#1976d2' : '#6b7280'
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Ajustar para que la semana empiece en domingo
  const firstDayOfWeek = monthStart.getDay()
  const daysFromPrevMonth = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const date = new Date(monthStart)
    date.setDate(date.getDate() - (firstDayOfWeek - i))
    return date
  })

  const allDays = [...daysFromPrevMonth, ...days]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h3" fontWeight={700}>
          Calendario
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Plus />}
            onClick={() => {
              setSelectedDate(new Date())
              setDialogOpen(true)
            }}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Agregar evento
          </Button>
        </Box>
      </Box>

      {/* Calendar */}
      <Paper sx={{ p: 3, borderRadius: '12px' }}>
        {/* Month Navigation */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Button onClick={() => navigateMonth('prev')} size="small" variant="outlined">
              ‹
            </Button>
            <Typography variant="h5" fontWeight={600}>
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </Typography>
            <Button onClick={() => navigateMonth('next')} size="small" variant="outlined">
              ›
            </Button>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              {format(monthStart, 'MMM d', { locale: es })} - {format(monthEnd, 'MMM d, yyyy', { locale: es })}
            </Typography>
            <Chip
              label="Hoy"
              size="small"
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>

        {/* Days of Week Header */}
        <Grid container sx={{ mb: 1 }}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <Grid item xs key={day}>
              <Box
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    fontSize: '12px',
                  }}
                >
                  {day}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Grid */}
        <Grid container>
          {allDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = isSameDay(day, new Date())
            const dayOccupancy = getDayOccupancy(day)
            const hasReservations = dayOccupancy.reservations.length > 0

            return (
              <Grid item xs key={index}>
                <Box
                  onClick={() => handleDateClick(day)}
                  sx={{
                    p: 2,
                    height: 120,
                    border: '1px solid #e5e7eb',
                    borderTop: 'none',
                    borderLeft: 'none',
                    bgcolor: isToday ? '#f3f8ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: isCurrentMonth ? 1 : 0.3,
                    '&:hover': {
                      bgcolor: isToday ? '#e3f2fd' : '#f9fafb',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    '&:nth-child(7n)': {
                      borderRight: 'none',
                    },
                  }}
                >
                  {/* Date number */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isToday ? 700 : 500,
                      color: isToday ? 'primary.main' : isCurrentMonth ? 'text.primary' : 'text.secondary',
                      fontSize: '14px',
                      mb: 1,
                    }}
                  >
                    {day.getDate()}
                  </Typography>

                  {/* Events/Reservations */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {hasReservations && (
                      <Box
                        sx={{
                          p: 1,
                          bgcolor: '#e3f2fd',
                          borderRadius: '4px',
                          border: '1px solid #bbdefb',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: '#1976d2',
                            fontSize: '10px',
                          }}
                        >
                          {dayOccupancy.reservations.length} reserva{dayOccupancy.reservations.length > 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    )}

                    {/* Occupancy indicator */}
                    {dayOccupancy.availableSpots < maxSpots && (
                      <Box
                        sx={{
                          width: '100%',
                          height: 3,
                          bgcolor: '#e0e0e0',
                          borderRadius: 1.5,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            borderRadius: 1.5,
                            bgcolor: dayOccupancy.availableSpots === 0 ? '#d32f2f' : '#4caf50',
                            width: `${((maxSpots - dayOccupancy.availableSpots) / maxSpots) * 100}%`
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </Paper>

      {/* Dialog for day details */}
      <Dialog
        open={dialogOpen && !!selectedDate}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedDate &&
            format(selectedDate, 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}
        </DialogTitle>
        <DialogContent>
          {selectedDate && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                p={2}
                bgcolor="#f5f5f5"
                borderRadius={2}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOn color="action" />
                  <Box>
                    <Typography fontWeight={600}>Ocupación</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {maxSpots - getDayOccupancy(selectedDate).availableSpots} de {maxSpots} lugares ocupados
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={`${getDayOccupancy(selectedDate).availableSpots} disponibles`}
                  color={getDayOccupancy(selectedDate).availableSpots === 0 ? 'error' : 'success'}
                />
              </Box>

              {getDayOccupancy(selectedDate).availableSpots > 0 && currentUser && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleReservation(selectedDate)}
                  disabled={getDayOccupancy(selectedDate).reservations.some(
                    (r) => r.userId === currentUser.id
                  )}
                >
                  {getDayOccupancy(selectedDate).reservations.some(
                    (r) => r.userId === currentUser.id
                  )
                    ? 'Ya tienes una reserva'
                    : 'Hacer Reserva'}
                </Button>
              )}

              {getDayOccupancy(selectedDate).reservations.length > 0 && (
                <Box>
                  <Typography fontWeight={600} mb={1}>
                    Reservas del día
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {getDayOccupancy(selectedDate).reservations.map((reservation) => {
                      const employee = (users ?? []).find((e) => e.id === reservation.userId)
                      const team = employee?.teamId ? (teams ?? []).find((t) => t.id === employee.teamId) : null
                      const isCurrentUser = employee?.id === currentUser?.id

                      return (
                        <Box
                          key={reservation.id}
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          p={1}
                          mb={1}
                          borderRadius={1}
                          bgcolor="#f5f5f5"
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: getTeamColor(employee?.teamId) + '20'
                              }}
                            >
                              <Typography fontSize={12}>
                                {employee?.name
                                  ? employee.name
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                  : '?'}
                              </Typography>
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {employee?.name || 'Usuario desconocido'}
                              </Typography>
                              {team && (
                                <Typography variant="caption" color="text.secondary">
                                  {team.name}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          {isCurrentUser && (
                            <Tooltip title="Cancelar reserva">
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleCancelReservation(reservation.id)}
                                startIcon={<CancelIcon />}
                              >
                                Cancelar
                              </Button>
                            </Tooltip>
                          )}
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 