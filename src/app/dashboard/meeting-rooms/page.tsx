'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, Clock, Users, MapPin, Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface MeetingRoom {
  id: string
  name: string
  description?: string
  capacity: number
  isActive: boolean
}

interface Booking {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  userId: string
  meetingRoomId: string
  user: {
    id: string
    name: string
    email: string
  }
  meetingRoom: {
    id: string
    name: string
  }
}

export default function MeetingRoomsPage() {
  const { data: session } = useSession()
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [roomsResponse, bookingsResponse] = await Promise.all([
        fetch('/api/meeting-rooms'),
        fetch('/api/meeting-room-bookings')
      ])

      if (roomsResponse.ok) {
        const rooms = await roomsResponse.json()
        setMeetingRooms(rooms)
      }

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        setBookings(bookingsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBooking = async (formData: FormData) => {
    try {
      const response = await fetch('/api/meeting-room-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
          startTime: formData.get('startTime'),
          endTime: formData.get('endTime'),
          userId: session?.user?.id,
          meetingRoomId: selectedRoom?.id,
        }),
      })

      if (response.ok) {
        toast.success('Reserva creada exitosamente')
        setShowCreateDialog(false)
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear la reserva')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Error al crear la reserva')
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reserva?')) return

    try {
      const response = await fetch(`/api/meeting-room-bookings?id=${bookingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Reserva eliminada exitosamente')
        fetchData()
      } else {
        toast.error('Error al eliminar la reserva')
      }
    } catch (error) {
      console.error('Error deleting booking:', error)
      toast.error('Error al eliminar la reserva')
    }
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getBookingsForRoom = (roomId: string) => {
    return bookings.filter(booking => booking.meetingRoomId === roomId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-lg">Cargando salas de reuniones...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso denegado</h1>
          <p>Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Salas de Reuniones</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {meetingRooms.map((room) => (
          <Card key={room.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {room.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {room.description}
                  </p>
                </div>
                <Badge variant={room.isActive ? "default" : "secondary"}>
                  {room.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4" />
                <span className="text-sm">Capacidad: {room.capacity} personas</span>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Reservas actuales:</h4>
                {getBookingsForRoom(room.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay reservas</p>
                ) : (
                  <div className="space-y-2">
                    {getBookingsForRoom(room.id).slice(0, 3).map((booking) => (
                      <div key={booking.id} className="p-2 bg-muted rounded-md">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{booking.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.user.name}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">
                                {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {getBookingsForRoom(room.id).length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{getBookingsForRoom(room.id).length - 3} más...
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => {
                  setSelectedRoom(room)
                  setShowCreateDialog(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Reservar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para crear reserva */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nueva Reserva</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleCreateBooking(new FormData(e.currentTarget))
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Título de la reunión
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Descripción (opcional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="meetingRoom" className="text-sm font-medium">
                  Sala de reuniones
                </label>
                <select
                  id="meetingRoom"
                  name="meetingRoom"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) => {
                    const room = meetingRooms.find(r => r.id === e.target.value)
                    setSelectedRoom(room || null)
                  }}
                >
                  <option value="">Seleccionar sala</option>
                  {meetingRooms.filter(room => room.isActive).map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="startTime" className="text-sm font-medium">
                    Inicio
                  </label>
                  <input
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="endTime" className="text-sm font-medium">
                    Fin
                  </label>
                  <input
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Crear Reserva
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 