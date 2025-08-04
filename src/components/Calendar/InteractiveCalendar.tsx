'use client'

import React, { useState, useMemo } from 'react'
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
} from '@mui/material'
import {
  CalendarToday,
  People,
  Warning,
  Info,
} from '@mui/icons-material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import type { ReservationWithUser } from '@/types'

// Configurar dayjs con locale español
dayjs.locale('es')

interface InteractiveCalendarProps {
  reservations: ReservationWithUser[]
  onDayClick?: (date: Date) => void
  onReservationClick?: (reservation: ReservationWithUser) => void
  maxSpotsPerDay?: number
  config?: {
    maxSpotsPerDay: number
    allowWeekendReservations: boolean
    allowHolidayReservations: boolean
  }
}

export default function InteractiveCalendar({
  reservations,
  onDayClick,
  onReservationClick,
  maxSpotsPerDay = 12
}: InteractiveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

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

  // Obtener reservas para una fecha específica
  const getReservationsForDate = (date: Date) => {
    return reservations.filter(reservation => 
      dayjs(new Date(reservation.date)).isSame(date, 'day')
    )
  }

  // Calcular estadísticas del día
  const getDayStats = (date: Date) => {
    const dayReservations = getReservationsForDate(date)
    const reservedSpots = dayReservations.length
    const availableSpots = maxSpotsPerDay - reservedSpots
    const isFull = reservedSpots >= maxSpotsPerDay
    const isToday = dayjs(date).isSame(dayjs(), 'day')
    const isCurrentMonth = dayjs(date).isSame(dayjs(currentDate), 'month')

    return {
      reservedSpots,
      availableSpots,
      isFull,
      isToday,
      isCurrentMonth,
      reservations: dayReservations
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

  const getDayColor = (stats: ReturnType<typeof getDayStats>) => {
    if (!stats.isCurrentMonth) return 'grey.300'
    if (stats.isToday) return 'primary.light'
    if (stats.isFull) return 'error.light'
    if (stats.reservedSpots > 0) return 'warning.light'
    return 'background.paper'
  }

  const getDayTextColor = (stats: ReturnType<typeof getDayStats>) => {
    if (!stats.isCurrentMonth) return 'text.disabled'
    if (stats.isToday) return 'primary.contrastText'
    if (stats.isFull) return 'error.contrastText'
    return 'text.primary'
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
          const stats = getDayStats(day)
          
          return (
            <Grid item xs key={day.toISOString()}>
              <Paper
                elevation={stats.isToday ? 4 : 1}
                sx={{
                  p: 1,
                  minHeight: 80,
                  cursor: 'pointer',
                  backgroundColor: getDayColor(stats),
                  color: getDayTextColor(stats),
                  '&:hover': {
                    backgroundColor: stats.isCurrentMonth ? 'action.hover' : 'grey.300',
                    transform: 'scale(1.02)',
                    transition: 'all 0.2s ease-in-out'
                  },
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                  border: stats.isToday ? 2 : 0,
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
                      fontWeight: stats.isToday ? 'bold' : 'normal',
                      fontSize: '0.875rem'
                    }}
                  >
                    {dayjs(day).format('d')}
                  </Typography>

                  {/* Indicadores de reservas */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    {stats.isCurrentMonth && (
                      <>
                        {stats.isFull && (
                          <Chip
                            icon={<Warning />}
                            label="Completo"
                            size="small"
                            color="error"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                        
                        {stats.reservedSpots > 0 && !stats.isFull && (
                          <Chip
                            icon={<People />}
                            label={`${stats.reservedSpots}/${maxSpotsPerDay}`}
                            size="small"
                            color="warning"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                        
                        {stats.reservedSpots === 0 && (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Disponible"
                            size="small"
                            color="success"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </>
                    )}
                  </Box>

                  {/* Badge para múltiples reservas */}
                  {stats.reservations.length > 3 && (
                    <Badge
                      badgeContent={stats.reservations.length}
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          height: 18,
                          minWidth: 18
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
        <Chip icon={<People />} label="Con reservas" color="warning" size="small" />
        <Chip icon={<Warning />} label="Completo" color="error" size="small" />
        <Chip icon={<Info />} label="Hoy" color="primary" size="small" />
      </Box>

      {/* Dialog con detalles del día */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
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
            const stats = getDayStats(selectedDate)
            
            return (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Estado del día
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<People />}
                      label={`Reservados: ${stats.reservedSpots}`}
                      color="warning"
                    />
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={`Disponibles: ${stats.availableSpots}`}
                      color="success"
                    />
                    {stats.isFull && (
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
                  Reservas del día
                </Typography>
                
                {stats.reservations.length > 0 ? (
                  <List>
                    {stats.reservations.map((reservation) => (
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
                    No hay reservas para este día
                  </Typography>
                )}
              </Box>
            )
          })()}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
} 