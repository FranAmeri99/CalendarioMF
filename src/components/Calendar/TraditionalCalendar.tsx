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
} from '@mui/material'
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { es } from 'date-fns/locale'
import { format, isSameDay, parseISO } from 'date-fns'
import {
  LocationOn,
  Close as CancelIcon,
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

interface TraditionalCalendarProps {
  reservations: Reservation[]
  users: User[]
  teams: Team[]
  currentUser: User | null
  maxSpots: number
  onCreateReservation: (date: string) => Promise<void>
  onCancelReservation: (reservationId: string) => Promise<void>
}

export default function TraditionalCalendar({
  reservations,
  users,
  teams,
  currentUser,
  maxSpots,
  onCreateReservation,
  onCancelReservation,
}: TraditionalCalendarProps) {
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

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date)
      setDialogOpen(true)
    }
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

  const renderDayContents = (day: Date) => {
    const dayOccupancy = getDayOccupancy(day)
    const isToday = isSameDay(day, new Date())
    const isPast = day < new Date()
    const occupancyRate = ((maxSpots - dayOccupancy.availableSpots) / maxSpots) * 100

    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0.5,
        }}
      >
        {/* Número del día */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: isToday ? 700 : 500,
            color: isToday ? 'primary.main' : 'text.primary',
            fontSize: '14px',
            mb: 0.5,
          }}
        >
          {day.getDate()}
        </Typography>

        {/* Indicador de ocupación */}
        {dayOccupancy.availableSpots < maxSpots && (
          <Box
            sx={{
              width: '100%',
              height: 3,
              bgcolor: '#e0e0e0',
              borderRadius: 1.5,
              overflow: 'hidden',
              mb: 0.5,
            }}
          >
            <Box
              sx={{
                height: '100%',
                borderRadius: 1.5,
                bgcolor: occupancyRate > 80 ? '#d32f2f' : 
                        occupancyRate > 50 ? '#fbc02d' : '#4caf50',
                width: `${occupancyRate}%`
              }}
            />
          </Box>
        )}

        {/* Contador de ocupación */}
        <Typography
          variant="caption"
          sx={{
            fontSize: '10px',
            color: 'text.secondary',
            lineHeight: 1,
          }}
        >
          {maxSpots - dayOccupancy.availableSpots}/{maxSpots}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h3" fontWeight={700}>
          Calendario
        </Typography>
      </Box>

      {/* Calendar */}
      <Paper sx={{ p: 2, maxWidth: 'fit-content' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            value={null}
            onChange={handleDateChange}
            sx={{
              '& .MuiPickersCalendarHeader-root': {
                mb: 2,
              },
              '& .MuiDayCalendar-weekDayLabel': {
                fontWeight: 600,
                color: 'text.secondary',
              },
              '& .MuiPickersDay-root': {
                width: 40,
                height: 40,
                fontSize: '14px',
                position: 'relative',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              },
            }}
          />
        </LocalizationProvider>
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