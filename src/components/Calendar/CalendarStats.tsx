'use client'

import React, { useMemo } from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material'
import {
  Check,
  People,
  Business,
  CalendarToday,
  Warning,
} from '@mui/icons-material'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import isBetween from 'dayjs/plugin/isBetween'
import type { ReservationWithUser } from '@/types'

// Configurar dayjs con locale español y plugins
dayjs.locale('es')
dayjs.extend(isBetween)

interface CalendarStatsProps {
  reservations: ReservationWithUser[]
  maxSpotsPerDay?: number
}

export default function CalendarStats({ reservations, maxSpotsPerDay = 12 }: CalendarStatsProps) {
  // Calcular estadísticas
  const stats = useMemo(() => {
    const today = new Date()
    const startOfCurrentWeek = dayjs(today).startOf('week')
    const endOfCurrentWeek = dayjs(today).endOf('week')
    const weekDays: Date[] = []
    
    let currentDay = startOfCurrentWeek
    while (currentDay.isBefore(endOfCurrentWeek) || currentDay.isSame(endOfCurrentWeek, 'day')) {
      weekDays.push(currentDay.toDate())
      currentDay = currentDay.add(1, 'day')
    }

    // Reservas de esta semana
    const weekReservations = reservations.filter(reservation => {
      const reservationDate = dayjs(reservation.date)
      return reservationDate.isBetween(startOfCurrentWeek, endOfCurrentWeek, 'day', '[]')
    })

    // Días más ocupados
    const dayStats = weekDays.map((day: Date) => {
      const dayReservations = reservations.filter(reservation =>
        dayjs(reservation.date).isSame(day, 'day')
      )
      return {
        date: day,
        count: dayReservations.length
      }
    })

    // Encontrar el día más ocupado
    const mostOccupiedDay = dayStats.reduce((a: any, b: any) => a.count > b.count ? a : b)

    // Equipos con más reservas
    const teamStats = reservations.reduce((acc, reservation) => {
      if (reservation.team) {
        const teamName = reservation.team.name
        acc[teamName] = (acc[teamName] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const topTeams = Object.entries(teamStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    // Usuarios más activos
    const userStats = reservations.reduce((acc, reservation) => {
      const userName = reservation.user.name
      acc[userName] = (acc[userName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topUsers = Object.entries(userStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      weekReservations: weekReservations.length,
      totalReservations: reservations.length,
      dayStats,
      topTeams,
      topUsers,
      mostOccupiedDay: mostOccupiedDay,
      averageOccupancy: reservations.length > 0 ? 
        (reservations.length / dayStats.filter(d => d.count > 0).length).toFixed(1) : 0
    }
  }, [reservations, maxSpotsPerDay])

  return (
    <Grid container spacing={3}>
      {/* Estadísticas generales */}
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Check color="primary" />
              Estadísticas Generales
            </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary.contrastText">
                    {stats.totalReservations}
                  </Typography>
                  <Typography variant="body2" color="primary.contrastText">
                    Total Reservas
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="success.contrastText">
                    {stats.weekReservations}
                  </Typography>
                  <Typography variant="body2" color="success.contrastText">
                    Esta Semana
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Promedio de ocupación: {stats.averageOccupancy} reservas/día
            </Typography>
          </Box>
        </Paper>
      </Grid>

      {/* Día más ocupado */}
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="error" />
            Día Más Ocupado
          </Typography>
          
          {stats.mostOccupiedDay && stats.mostOccupiedDay.count > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h5" color="error">
                {dayjs(stats.mostOccupiedDay.date).format('EEEE, d \'de\' MMMM')}
              </Typography>
              <Typography variant="h4" color="error" sx={{ fontWeight: 'bold' }}>
                {stats.mostOccupiedDay.count}/{maxSpotsPerDay} lugares
              </Typography>
              <Chip
                label={stats.mostOccupiedDay.count >= maxSpotsPerDay ? "Completo" : "Alta ocupación"}
                color={stats.mostOccupiedDay.count >= maxSpotsPerDay ? "error" : "warning"}
                sx={{ mt: 1 }}
              />
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              No hay reservas registradas
            </Typography>
          )}
        </Paper>
      </Grid>

      {/* Equipos más activos */}
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business color="primary" />
            Equipos Más Activos
          </Typography>
          
          <List sx={{ mt: 2 }}>
            {stats.topTeams.length > 0 ? (
              stats.topTeams.map((team, index) => (
                <ListItem key={team.name} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze' }}>
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={team.name}
                    secondary={`${team.count} reservas`}
                  />
                  <Chip
                    label={`${team.count}`}
                    color="primary"
                    size="small"
                  />
                </ListItem>
              ))
            ) : (
              <Typography color="text.secondary" align="center">
                No hay datos de equipos
              </Typography>
            )}
          </List>
        </Paper>
      </Grid>

      {/* Usuarios más activos */}
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <People color="primary" />
            Usuarios Más Activos
          </Typography>
          
          <List sx={{ mt: 2 }}>
            {stats.topUsers.length > 0 ? (
              stats.topUsers.map((user, index) => (
                <ListItem key={user.name} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze' }}>
                      {user.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={`${user.count} reservas`}
                  />
                  <Chip
                    label={`${user.count}`}
                    color="primary"
                    size="small"
                  />
                </ListItem>
              ))
            ) : (
              <Typography color="text.secondary" align="center">
                No hay datos de usuarios
              </Typography>
            )}
          </List>
        </Paper>
      </Grid>
    </Grid>
  )
} 