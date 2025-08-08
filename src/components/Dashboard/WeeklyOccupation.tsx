'use client'

import React from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
} from '@mui/material'
import { Business } from '@mui/icons-material'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import updateLocale from 'dayjs/plugin/updateLocale'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

// Configurar dayjs con locale español y zona horaria
dayjs.extend(updateLocale)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('es')

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
  attendanceDay?: number // 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo
  members?: {
    id: string
    name: string
    email: string
  }[]
}

interface WeeklyOccupationProps {
  reservations: Reservation[]
  teams: Team[]
  maxSpots: number
}

export default function WeeklyOccupation({ reservations, teams, maxSpots }: WeeklyOccupationProps) {
  const today = dayjs().tz('America/Argentina/Buenos_Aires').startOf('day')
  const startOfCurrentWeek = today.startOf('week') // Lunes como inicio de semana

  const weekDays = Array.from({ length: 7 }, (_, i) => dayjs(startOfCurrentWeek).tz('America/Argentina/Buenos_Aires').add(i, 'day'))

  // Función para obtener las reservas individuales para un día específico
  const getIndividualReservationsForDay = (date: dayjs.Dayjs) => {
    const dayReservations = reservations.filter(reservation => {
      // Convertir la fecha de la reserva a UTC primero, luego a zona horaria de Argentina
      const reservationDate = dayjs.utc(reservation.date).tz('America/Argentina/Buenos_Aires').startOf('day')
      const compareDate = date.tz('America/Argentina/Buenos_Aires').startOf('day')
      const isSame = compareDate.isSame(reservationDate, 'day')
      
      return isSame
    })
    
    return dayReservations
  }

  // Función para obtener los equipos que asisten en un día específico
  const getTeamsForDate = (date: dayjs.Dayjs) => {
    const dayOfWeek = date.day() // 0=domingo, 1=lunes, 2=martes, etc.
    // Convertir de domingo=0 a lunes=0 (igual que en reservations/page.tsx)
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    return teams.filter(team => team.attendanceDay === adjustedDay)
  }

  // Función para obtener el total de asistencia esperada para una fecha (individual + miembros de equipos)
  const getTotalExpectedAttendanceForDate = (date: dayjs.Dayjs) => {
    const individualReservations = getIndividualReservationsForDay(date)
    const teamsForDay = getTeamsForDate(date)

    // Set para rastrear usuarios únicos (evitar duplicados cuando una persona está en múltiples equipos)
    const uniqueUsers = new Set<string>()

    // Agregar usuarios con reservas individuales
    individualReservations.forEach(reservation => {
      uniqueUsers.add(reservation.userId)
    })

    // Agregar miembros de equipos (solo si no tienen reserva individual)
    teamsForDay.forEach(team => {
      if (team.members && team.members.length > 0) {
        team.members.forEach(member => {
          // Solo agregar si no tiene reserva individual para este día
          const hasIndividualReservation = individualReservations.some(reservation => 
            reservation.userId === member.id
          )
          
          if (!hasIndividualReservation) {
            uniqueUsers.add(member.id)
          }
        })
      }
    })

    return uniqueUsers.size
  }

  const getReservationsForDay = (date: dayjs.Dayjs) => {
    return getTotalExpectedAttendanceForDate(date)
  }

  const getOccupationPercentage = (date: dayjs.Dayjs) => {
    const dayReservations = getReservationsForDay(date)
    return Math.round((dayReservations / maxSpots) * 100)
  }

  const getOccupationColor = (percentage: number) => {
    if (percentage >= 90) return '#d32f2f' // Rojo - muy ocupado
    if (percentage >= 70) return '#f57c00' // Naranja - ocupado
    if (percentage >= 50) return '#fbc02d' // Amarillo - moderado
    return '#4caf50' // Verde - disponible
  }

  return (
    <Paper
      sx={{
        p: { xs: '16px', sm: '20px', md: '24px' },
        background: '#ffffff',
        border: '1px solid #e8e8e8',
        borderRadius: { xs: '12px', sm: '16px' },
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        height: '100%',
      }}
    >
      <Box display="flex" alignItems="center" mb={{ xs: '16px', sm: '20px', md: '24px' }}>
        <Business sx={{ mr: { xs: '6px', sm: '8px' }, color: '#1976d2' }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '16px', sm: '18px' },
            lineHeight: { xs: '20px', sm: '24px' },
            color: '#1a1a1a'
          }}
        >
          Ocupación Semanal
        </Typography>
      </Box>

      <Grid container spacing={{ xs: '4px', sm: '6px', md: '8px' }}>
        {weekDays.map((day, index) => {
          const occupation = getReservationsForDay(day)
          const percentage = getOccupationPercentage(day)
          const color = getOccupationColor(percentage)
          const isToday = day.isSame(today, 'day')

          return (
            <Grid item xs={12} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: { xs: '8px', sm: '10px', md: '12px' },
                  borderRadius: { xs: '6px', sm: '8px' },
                  bgcolor: isToday ? '#f5f5f5' : 'transparent',
                  border: isToday ? '1px solid #e0e0e0' : 'none',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '11px', sm: '12px' },
                      lineHeight: { xs: '14px', sm: '16px' },
                      color: '#1a1a1a',
                      textTransform: 'capitalize'
                    }}
                  >
                    {day.format('dddd')}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '9px', sm: '10px' },
                      lineHeight: { xs: '12px', sm: '14px' }
                    }}
                  >
                    {day.format('DD/MM')}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={{ xs: '4px', sm: '6px', md: '8px' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '11px', sm: '12px' },
                      lineHeight: { xs: '14px', sm: '16px' },
                      color: '#1a1a1a'
                    }}
                  >
                    {occupation}/{maxSpots}
                  </Typography>
                  <Box
                    sx={{
                      width: { xs: '32px', sm: '36px', md: '40px' },
                      height: { xs: '6px', sm: '7px', md: '8px' },
                      borderRadius: { xs: '3px', sm: '4px' },
                      bgcolor: '#e0e0e0',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${percentage}%`,
                        bgcolor: color,
                        borderRadius: { xs: '3px', sm: '4px' },
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '9px', sm: '10px' },
                      lineHeight: { xs: '12px', sm: '14px' },
                      color: color,
                      minWidth: { xs: '20px', sm: '24px' },
                      textAlign: 'right'
                    }}
                  >
                    {percentage}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )
        })}
      </Grid>

      <Box mt={{ xs: '12px', sm: '16px' }} display="flex" gap={{ xs: '8px', sm: '12px', md: '16px' }} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={{ xs: '2px', sm: '4px' }}>
          <Box sx={{ 
            width: { xs: '10px', sm: '12px' }, 
            height: { xs: '10px', sm: '12px' }, 
            borderRadius: { xs: '1px', sm: '2px' }, 
            bgcolor: '#4caf50' 
          }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '10px', sm: '12px' } }}>
            Disponible
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={{ xs: '2px', sm: '4px' }}>
          <Box sx={{ 
            width: { xs: '10px', sm: '12px' }, 
            height: { xs: '10px', sm: '12px' }, 
            borderRadius: { xs: '1px', sm: '2px' }, 
            bgcolor: '#fbc02d' 
          }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '10px', sm: '12px' } }}>
            Moderado
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={{ xs: '2px', sm: '4px' }}>
          <Box sx={{ 
            width: { xs: '10px', sm: '12px' }, 
            height: { xs: '10px', sm: '12px' }, 
            borderRadius: { xs: '1px', sm: '2px' }, 
            bgcolor: '#f57c00' 
          }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '10px', sm: '12px' } }}>
            Ocupado
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={{ xs: '2px', sm: '4px' }}>
          <Box sx={{ 
            width: { xs: '10px', sm: '12px' }, 
            height: { xs: '10px', sm: '12px' }, 
            borderRadius: { xs: '1px', sm: '2px' }, 
            bgcolor: '#d32f2f' 
          }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '10px', sm: '12px' } }}>
            Completo
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
} 