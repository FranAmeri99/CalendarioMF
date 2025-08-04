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
}

export default function UpcomingReservations({ reservations }: UpcomingReservationsProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingReservations = reservations
    .filter(reservation => {
      const reservationDate = new Date(reservation.date)
      reservationDate.setHours(0, 0, 0, 0)
      return reservationDate >= today
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

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
      <Box display="flex" alignItems="center" mb="16px">
        <CalendarToday sx={{ mr: '8px', color: '#1976d2' }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '18px',
            lineHeight: '24px',
            color: '#1a1a1a'
          }}
        >
          Próximas Reservas
        </Typography>
      </Box>

      {upcomingReservations.length === 0 ? (
        <Box textAlign="center" py="32px">
          <Typography color="text.secondary">
            No hay reservas próximas
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {upcomingReservations.map((reservation) => (
            <ListItem
              key={reservation.id}
              sx={{
                px: 0,
                py: '12px',
                borderBottom: '1px solid #f0f0f0',
                '&:last-child': {
                  borderBottom: 'none'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}>
                  <Person sx={{ fontSize: 16 }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap="8px">
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        fontSize: '14px',
                        lineHeight: '20px',
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
                          fontSize: '10px',
                          height: '20px'
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
                      fontSize: '12px',
                      lineHeight: '16px',
                      mt: '4px'
                    }}
                  >
                    {dayjs(reservation.date).format('EEEE, d \'de\' MMMM')}
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