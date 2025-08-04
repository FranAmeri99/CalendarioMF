'use client'

import { ModernCalendarView } from '@/components/Calendar/ModernCalendarView'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

// Datos de ejemplo
const mockUsers = [
  { id: '1', name: 'Juan Pérez', email: 'juan@empresa.com', role: 'USER', teamId: '1' },
  { id: '2', name: 'María García', email: 'maria@empresa.com', role: 'MANAGER', teamId: '1' },
  { id: '3', name: 'Carlos López', email: 'carlos@empresa.com', role: 'USER', teamId: '2' },
]

const mockTeams = [
  { id: '1', name: 'Desarrollo', description: 'Equipo de desarrollo', color: '#3b82f6' },
  { id: '2', name: 'Diseño', description: 'Equipo de diseño', color: '#10b981' },
  { id: '3', name: 'Marketing', description: 'Equipo de marketing', color: '#f59e0b' },
]

const mockReservations = [
  {
    id: '1',
    date: '2024-01-15',
    userId: '1',
    teamId: '1',
    status: 'confirmed' as const,
    user: { id: '1', name: 'Juan Pérez', email: 'juan@empresa.com' },
    team: { id: '1', name: 'Desarrollo' }
  },
  {
    id: '2',
    date: '2024-01-15',
    userId: '2',
    teamId: '1',
    status: 'confirmed' as const,
    user: { id: '2', name: 'María García', email: 'maria@empresa.com' },
    team: { id: '1', name: 'Desarrollo' }
  },
  {
    id: '3',
    date: '2024-01-16',
    userId: '3',
    teamId: '2',
    status: 'confirmed' as const,
    user: { id: '3', name: 'Carlos López', email: 'carlos@empresa.com' },
    team: { id: '2', name: 'Diseño' }
  },
]

export default function CalendarPage() {
  const { data: session } = useSession()
  const [reservations, setReservations] = useState(mockReservations)

  const handleCreateReservation = async (date: string) => {
    if (!session?.user) return

    // Simular creación de reserva
    const newReservation = {
      id: Date.now().toString(),
      date,
      userId: session.user.id || '1',
      teamId: '1',
      status: 'confirmed' as const,
      user: { 
        id: session.user.id || '1', 
        name: session.user.name || 'Usuario', 
        email: session.user.email || 'usuario@empresa.com' 
      },
      team: { id: '1', name: 'Desarrollo' }
    }

    setReservations(prev => [...prev, newReservation])
  }

  const handleCancelReservation = async (reservationId: string) => {
    setReservations(prev => prev.filter(r => r.id !== reservationId))
  }

  const currentUser = session?.user ? {
    id: session.user.id || '1',
    name: session.user.name || 'Usuario',
    email: session.user.email || 'usuario@empresa.com',
    role: 'USER',
    teamId: '1'
  } : null

  return (
    <div className="container mx-auto p-6">
      <ModernCalendarView
        reservations={reservations}
        users={mockUsers}
        teams={mockTeams}
        currentUser={currentUser}
        maxSpots={12}
        onCreateReservation={handleCreateReservation}
        onCancelReservation={handleCancelReservation}
      />
    </div>
  )
} 