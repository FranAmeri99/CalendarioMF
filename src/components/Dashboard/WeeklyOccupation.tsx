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

// Configurar dayjs con locale español
dayjs.extend(updateLocale)
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

interface WeeklyOccupationProps {
  reservations: Reservation[]
  maxSpots: number
}

export default function WeeklyOccupation({ reservations, maxSpots }: WeeklyOccupationProps) {
  const today = dayjs().startOf('day')
  const startOfCurrentWeek = today.startOf('week') // Lunes como inicio de semana

  const weekDays = Array.from({ length: 7 }, (_, i) => dayjs(startOfCurrentWeek).add(i, 'day'))

  const getReservationsForDay = (date: dayjs.Dayjs) => {
    const dayReservations = reservations.filter(reservation => {
      const reservationDate = dayjs(reservation.date).startOf('day')
      const compareDate = date.startOf('day')
      const isSame = compareDate.isSame(reservationDate, 'day')
      
      // Debug log para el miércoles
      if (date.format('dddd') === 'miércoles') {
        console.log(`🔍 Miércoles debug: ${date.format('YYYY-MM-DD')} vs ${reservationDate.format('YYYY-MM-DD')} = ${isSame}`)
      }
      
      return isSame
    })
    
    console.log(`📅 ${date.format('dddd')} (${date.format('YYYY-MM-DD')}): ${dayReservations.length} reservas`)
    return dayReservations.length
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
        p: '24px',
        background: '#ffffff',
        border: '1px solid #e8e8e8',
        borderRadius: '16px',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        height: '100%',
      }}
    >
      <Box display="flex" alignItems="center" mb="24px">
        <Business sx={{ mr: '8px', color: '#1976d2' }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '18px',
            lineHeight: '24px',
            color: '#1a1a1a'
          }}
        >
          Ocupación Semanal
        </Typography>
      </Box>

      <Grid container spacing="8px">
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
                  p: '12px',
                  borderRadius: '8px',
                  bgcolor: isToday ? '#f5f5f5' : 'transparent',
                  border: isToday ? '1px solid #e0e0e0' : 'none',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '12px',
                      lineHeight: '16px',
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
                      fontSize: '10px',
                      lineHeight: '14px'
                    }}
                  >
                    {day.format('d/M')}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap="8px">
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '12px',
                      lineHeight: '16px',
                      color: '#1a1a1a'
                    }}
                  >
                    {occupation}/{maxSpots}
                  </Typography>
                  <Box
                    sx={{
                      width: '40px',
                      height: '8px',
                      borderRadius: '4px',
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
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      fontSize: '10px',
                      lineHeight: '14px',
                      color: color,
                      minWidth: '24px',
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

      <Box mt="16px" display="flex" gap="16px" flexWrap="wrap">
        <Box display="flex" alignItems="center" gap="4px">
          <Box sx={{ width: '12px', height: '12px', borderRadius: '2px', bgcolor: '#4caf50' }} />
          <Typography variant="caption" color="text.secondary">
            Disponible
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap="4px">
          <Box sx={{ width: '12px', height: '12px', borderRadius: '2px', bgcolor: '#fbc02d' }} />
          <Typography variant="caption" color="text.secondary">
            Moderado
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap="4px">
          <Box sx={{ width: '12px', height: '12px', borderRadius: '2px', bgcolor: '#f57c00' }} />
          <Typography variant="caption" color="text.secondary">
            Ocupado
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap="4px">
          <Box sx={{ width: '12px', height: '12px', borderRadius: '2px', bgcolor: '#d32f2f' }} />
          <Typography variant="caption" color="text.secondary">
            Completo
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
} 