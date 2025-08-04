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
  const [maxSpots, setMaxSpots] = useState(19) // Valor por defecto que se actualizará con la configuración real

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
      
      // Obtener todos los datos del calendario en una sola llamada
      const response = await fetch('/api/calendar')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setReservations(data.reservations)
      setUsers(data.users)
      setTeams(data.teams)
      
      // Actualizar maxSpots con la configuración
      if (data.config?.maxSpotsPerDay) {
        console.log('🔧 Calendar - Setting maxSpots to:', data.config.maxSpotsPerDay)
        setMaxSpots(data.config.maxSpotsPerDay)
      } else {
        console.log('🔧 Calendar - No maxSpotsPerDay found in config')
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

  console.log('🔧 Calendar - Current maxSpots value:', maxSpots)
  
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