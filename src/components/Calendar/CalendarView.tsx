'use client'

import React, { useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material'
import {
  West as ChevronLeftIcon,
  East as ChevronRightIcon,
  LocationOn,
  Close as CancelIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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

interface CalendarViewProps {
  reservations: Reservation[]
  users: User[]
  teams: Team[]
  currentUser: User | null
  maxSpots?: number
  onCreateReservation?: (date: string) => Promise<void>
  onCancelReservation?: (reservationId: string) => Promise<void>
}

export default function CalendarView({
  reservations,
  users,
  teams,
  currentUser,
  maxSpots = 12,
  onCreateReservation,
  onCancelReservation,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const monthYear = currentDate.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day)
      days.push(dayDate)
    }
    
    return days
  }

  const getDayReservations = (dateStr: string) => {
    return reservations.filter((r) => r.date.split('T')[0] === dateStr)
  }

  const getDayOccupancy = (dateStr: string) => {
    const dayReservations = getDayReservations(dateStr)
    return {
      availableSpots: maxSpots - dayReservations.length,
      reservations: dayReservations,
    }
  }

  const handleReservation = async (date: string) => {
    if (onCreateReservation) {
      await onCreateReservation(date)
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
    const team = teams.find((t) => t.id === teamId)
    return team ? '#1976d2' : '#6b7280'
  }

  const days = getDaysInMonth(currentDate)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h3" fontWeight={700}>
          Calendario
        </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={() => navigateMonth('prev')}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              sx={{ 
                minWidth: 200, 
                textAlign: 'center', 
                textTransform: 'capitalize',
                fontWeight: 500
              }}
            >
              {monthYear}
            </Typography>
            <IconButton onClick={() => navigateMonth('next')}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
      </Box>

             {/* Calendar Card */}
       <Card>
         <CardContent sx={{ p: 2 }}>
           {/* Calendar Header - Days of week */}
           <Grid container sx={{ borderBottom: '1px solid #e0e0e0' }}>
             {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
               <Grid item xs key={day}>
                 <Box
                   sx={{
                     p: 2,
                     textAlign: 'center',
                     borderRight: '1px solid #e0e0e0',
                     '&:last-child': {
                       borderRight: 'none'
                     }
                   }}
                 >
                   <Typography
                     variant="body2"
                     sx={{
                       fontWeight: 600,
                       fontSize: '14px',
                       color: 'text.secondary',
                       textTransform: 'uppercase'
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
             {days.map((day, index) => {
               if (!day) {
                 return (
                   <Grid item xs key={index} sx={{ 
                     height: 120,
                     borderRight: '1px solid #e0e0e0',
                     borderBottom: '1px solid #e0e0e0',
                     '&:nth-child(7n)': {
                       borderRight: 'none'
                     }
                   }} />
                 )
               }

               const dateStr = day.toISOString().split('T')[0]
               const dayOccupancy = getDayOccupancy(dateStr)
               const isToday = dateStr === today
               const isPast = dateStr < today
               const occupancyRate = ((maxSpots - dayOccupancy.availableSpots) / maxSpots) * 100

               return (
                 <Grid item xs key={dateStr}>
                   <Box
                     onClick={() => {
                       if (!isPast) {
                         setSelectedDate(dateStr)
                         setDialogOpen(true)
                       }
                     }}
                     sx={{
                       p: 2,
                       height: 120,
                       border: '1px solid #e0e0e0',
                       borderTop: 'none',
                       borderLeft: 'none',
                       bgcolor: isToday ? '#f3f8ff' : '#ffffff',
                       opacity: isPast ? 0.5 : 1,
                       cursor: isPast ? 'not-allowed' : 'pointer',
                       transition: 'all 0.2s',
                       '&:hover': {
                         bgcolor: isPast ? '#f3f8ff' : '#f5f5f5',
                       },
                       display: 'flex',
                       flexDirection: 'column',
                       position: 'relative',
                       '&:nth-child(7n)': {
                         borderRight: 'none'
                       }
                     }}
                   >
                     {/* Date number */}
                     <Typography
                       variant="body1"
                       sx={{
                         fontWeight: isToday ? 700 : 500,
                         color: isToday ? 'primary.main' : 'text.primary',
                         fontSize: '16px',
                         mb: 1
                       }}
                     >
                       {day.getDate()}
                     </Typography>

                     {/* Occupancy info */}
                     <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                       <Typography
                         variant="caption"
                         sx={{
                           fontWeight: 600,
                           color: dayOccupancy.availableSpots === 0 ? 'error.main' : 'text.secondary',
                           mb: 0.5
                         }}
                       >
                         {dayOccupancy.availableSpots === 0 ? 'Completo' : `${dayOccupancy.availableSpots} disponibles`}
                       </Typography>
                       
                       {/* Progress bar */}
                       <Box
                         sx={{
                           width: '100%',
                           height: 6,
                           bgcolor: '#e0e0e0',
                           borderRadius: 3,
                           overflow: 'hidden',
                           mb: 1
                         }}
                       >
                         <Box
                           sx={{
                             height: '100%',
                             borderRadius: 3,
                             transition: 'width 0.3s',
                             bgcolor: occupancyRate > 80 ? '#d32f2f' : 
                                     occupancyRate > 50 ? '#fbc02d' : '#4caf50',
                             width: `${occupancyRate}%`
                           }}
                         />
                       </Box>

                       {/* Occupancy count */}
                       <Typography
                         variant="caption"
                         sx={{
                           color: 'text.secondary',
                           fontSize: '11px'
                         }}
                       >
                         {maxSpots - dayOccupancy.availableSpots}/{maxSpots}
                       </Typography>
                     </Box>
                   </Box>
                 </Grid>
               )
             })}
           </Grid>
         </CardContent>
       </Card>

      {/* Dialog for day details */}
      <Dialog 
        open={dialogOpen && !!selectedDate} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {selectedDate &&
            format(new Date(selectedDate), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}
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
                               <IconButton
                                 size="small"
                                 color="error"
                                 onClick={() => handleCancelReservation(reservation.id)}
                               >
                                 <CancelIcon />
                               </IconButton>
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