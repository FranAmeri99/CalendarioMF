'use client'

import { ModernCalendarView } from '@/components/Calendar/ModernCalendarView'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Reservation {
  id: string
  date: string
  userId: string
  teamId?: string
  status: 'confirmed' | 'pending' | 'cancelled'
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

export default function CalendarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [maxSpots, setMaxSpots] = useState(12)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Obtener datos de reservas y configuración en paralelo
      const [reservationsResponse, configResponse] = await Promise.all([
        fetch('/api/reservations'),
        fetch('/api/config')
      ])
      
      if (!reservationsResponse.ok) {
        throw new Error(`HTTP error! status: ${reservationsResponse.status}`)
      }
      
      const reservationsData = await reservationsResponse.json()
      
      if (reservationsData.error) {
        throw new Error(reservationsData.error)
      }

      // Asegurar que todas las reservas tengan el campo status
      const reservationsWithStatus = reservationsData.reservations.map((reservation: any) => ({
        ...reservation,
        status: reservation.status || 'confirmed'
      }))
      setReservations(reservationsWithStatus)
      setUsers(reservationsData.users)
      setTeams(reservationsData.teams)

      // Obtener configuración del sistema
      if (configResponse.ok) {
        const configData = await configResponse.json()
        if (configData.config?.maxSpotsPerDay) {
          setMaxSpots(configData.config.maxSpotsPerDay)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReservation = async (date: string) => {
    if (!session?.user) return

    try {
      const currentUserId = session.user.id
      const currentUser = users.find(u => u.id === currentUserId)
      
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: date,
          userId: currentUserId,
          teamId: currentUser?.teamId || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      alert('Reserva creada exitosamente')
      fetchData()
    } catch (error) {
      console.error('Error creating reservation:', error)
      alert('Error al crear la reserva')
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`/api/reservations?id=${reservationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      alert('Reserva cancelada exitosamente')
      fetchData()
    } catch (error) {
      console.error('Error canceling reservation:', error)
      alert('Error al cancelar la reserva')
    }
  }

  const currentUser = session?.user ? {
    id: session.user.id || '',
    name: session.user.name || '',
    email: session.user.email || '',
    role: session.user.role || 'USER',
    teamId: users.find(u => u.id === session.user.id)?.teamId
  } : null

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <ModernCalendarView
        reservations={reservations}
        users={users}
        teams={teams}
        currentUser={currentUser}
        maxSpots={maxSpots}
        onCreateReservation={handleCreateReservation}
        onCancelReservation={handleCancelReservation}
      />
    </div>
  )
} 