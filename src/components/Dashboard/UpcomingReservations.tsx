'use client'

import React from 'react'
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Box,
} from '@mui/material'
import { CalendarToday, Person } from '@mui/icons-material'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

// Configurar dayjs con locale español
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

interface UpcomingReservationsProps {
  reservations: Reservation[]
  currentUserId?: string
}

export default function UpcomingReservations({ reservations, currentUserId }: UpcomingReservationsProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingReservations = reservations
    .filter(reservation => {
      // Filtrar solo las reservas del usuario actual
      const isMyReservation = currentUserId ? reservation.userId === currentUserId : true
      
      const reservationDate = new Date(reservation.date)
      reservationDate.setHours(0, 0, 0, 0)
      const isUpcoming = reservationDate > today // Cambiado de >= a > para excluir hoy
      
      return isMyReservation && isUpcoming
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

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
      <Box display="flex" alignItems="center" mb={{ xs: '12px', sm: '16px' }}>
        <CalendarToday sx={{ mr: { xs: '6px', sm: '8px' }, color: '#1976d2' }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '16px', sm: '18px' },
            lineHeight: { xs: '20px', sm: '24px' },
            color: '#1a1a1a'
          }}
        >
          Mis Próximas Reservas
        </Typography>
      </Box>

      {upcomingReservations.length === 0 ? (
        <Box textAlign="center" py={{ xs: '24px', sm: '32px' }}>
          <Typography color="text.secondary" sx={{ fontSize: { xs: '14px', sm: '16px' } }}>
            No tienes reservas próximas
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {upcomingReservations.map((reservation) => (
            <ListItem
              key={reservation.id}
              sx={{
                px: 0,
                py: { xs: '8px', sm: '12px' },
                borderBottom: '1px solid #f0f0f0',
                '&:last-child': {
                  borderBottom: 'none'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ 
                  bgcolor: '#1976d2', 
                  width: { xs: 28, sm: 32 }, 
                  height: { xs: 28, sm: 32 } 
                }}>
                  <Person sx={{ fontSize: { xs: 14, sm: 16 } }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={{ xs: '4px', sm: '8px' }} flexWrap="wrap">
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '13px', sm: '14px' },
                        lineHeight: { xs: '18px', sm: '20px' },
                        color: '#1a1a1a'
                      }}
                    >
                      {reservation.user.name}
                    </Typography>
                    {reservation.team && (
                      <Chip
                        label={reservation.team.name}
                        size="small"
                        sx={{
                          bgcolor: '#e3f2fd',
                          color: '#1976d2',
                          fontSize: { xs: '9px', sm: '10px' },
                          height: { xs: '18px', sm: '20px' }
                        }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '11px', sm: '12px' },
                      lineHeight: { xs: '14px', sm: '16px' },
                      mt: { xs: '2px', sm: '4px' }
                    }}
                  >
                    {dayjs(reservation.date).format('dddd, D [de] MMMM')}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  )
} 