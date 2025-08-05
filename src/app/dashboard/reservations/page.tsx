'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Plus, Clock, Users, MapPin, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

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

interface AttendanceReservation {
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

export default function ReservationsPage() {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [attendanceReservations, setAttendanceReservations] = useState<AttendanceReservation[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [maxSpotsPerDay, setMaxSpotsPerDay] = useState(12)
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [roomsResponse, bookingsResponse, calendarResponse, teamsResponse] = await Promise.all([
        fetch('/api/meeting-rooms'),
        fetch('/api/meeting-room-bookings'),
        fetch('/api/calendar'),
        fetch('/api/teams?simple=true')
      ])

      if (roomsResponse.ok) {
        const rooms = await roomsResponse.json()
        setMeetingRooms(rooms)
      }

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        setBookings(bookingsData)
      }

      if (calendarResponse.ok) {
        const calendarData = await calendarResponse.json()
        setAttendanceReservations(calendarData.reservations || [])
        if (calendarData.config?.maxSpotsPerDay) {
          setMaxSpotsPerDay(calendarData.config.maxSpotsPerDay)
        }
      }

      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json()
        setTeams(Array.isArray(teamsData) ? teamsData : [])
      } else {
        console.error('Error fetching teams:', teamsResponse.status)
        setTeams([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

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

    // Agregar celdas vacías para los días antes del primer día del mes
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Agregar todos los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day)
      days.push(dayDate)
    }

    return days
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toLocaleDateString('en-CA') // YYYY-MM-DD
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.startTime)
      const bookingDateStr = bookingDate.toLocaleDateString('en-CA')
      return bookingDateStr === dateStr
    })
  }

  const getAttendanceReservationsForDate = (date: Date) => {
    const dateStr = date.toLocaleDateString('en-CA') // YYYY-MM-DD
    return attendanceReservations.filter(reservation => {
      const reservationDate = new Date(reservation.date)
      const reservationDateStr = reservationDate.toLocaleDateString('en-CA')
      return reservationDateStr === dateStr
    })
  }

  // Función para verificar si el usuario ya tiene una reserva para el día seleccionado
  const hasUserReservationForDate = (date: Date) => {
    const dateStr = date.toLocaleDateString('en-CA') // YYYY-MM-DD
    return attendanceReservations.some(reservation => {
      const reservationDate = new Date(reservation.date)
      const reservationDateStr = reservationDate.toLocaleDateString('en-CA')
      return reservationDateStr === dateStr && reservation.userId === session?.user?.id
    })
  }

  const handleDateClick = (date: Date) => {
    const dateStr = date.toLocaleDateString('en-CA')
    setSelectedDate(dateStr)
    setShowDetailsDialog(true)
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

  const handleCreateAttendance = async (formData: FormData) => {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          userId: session?.user?.id,
          teamId: session?.user?.teamId || null,
        }),
      })

      if (response.ok) {
        toast.success('Reserva de asistencia creada exitosamente')
        setShowAttendanceDialog(false)
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear la reserva de asistencia')
      }
    } catch (error) {
      console.error('Error creating attendance:', error)
      toast.error('Error al crear la reserva de asistencia')
    }
  }

  const handleDeleteAttendance = async (reservationId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar tu asistencia?')) return

    try {
      const response = await fetch(`/api/reservations?id=${reservationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Asistencia eliminada exitosamente')
        fetchData()
      } else {
        toast.error('Error al eliminar la asistencia')
      }
    } catch (error) {
      console.error('Error deleting attendance:', error)
      toast.error('Error al eliminar la asistencia')
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRoomColor = (roomId: string) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
    const roomIndex = meetingRooms.findIndex(room => room.id === roomId)
    return colors[roomIndex % colors.length]
  }

  const days = getDaysInMonth(currentDate)
  const today = new Date().toLocaleDateString('en-CA')
  const monthYear = currentDate.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-lg">Cargando calendario...</p>
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
    <div className="container mx-auto p-2 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Reservas</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard'}
            className="w-full sm:w-auto"
          >
            <MapPin className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Inicio</span>
          </Button>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl capitalize">{monthYear}</CardTitle>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          {/* Encabezados de días */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Cuadrícula del calendario */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="p-2" />
              }

              const dayBookings = getBookingsForDate(day)
              const dayAttendanceReservations = getAttendanceReservationsForDate(day)
              const isToday = day.toLocaleDateString('en-CA') === today
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()

                             return (
                 <div
                   key={index}
                   className={`p-1 sm:p-2 min-h-[80px] sm:min-h-[120px] border rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
                     isToday ? 'bg-blue-50 border-blue-200' : ''
                   } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                   onClick={() => handleDateClick(day)}
                 >
                   <div className="flex justify-between items-start mb-1">
                     <span className={`text-xs sm:text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                       {day.getDate()}
                     </span>
                     <div className="flex gap-0.5 sm:gap-1">
                       {dayBookings.length > 0 && (
                         <Badge variant="secondary" className="text-xs px-1 py-0.5">
                           {dayBookings.length}
                         </Badge>
                       )}
                       {dayAttendanceReservations.length > 0 && (
                         <Badge variant="outline" className="text-xs px-1 py-0.5">
                           {dayAttendanceReservations.length}/{maxSpotsPerDay}
                         </Badge>
                       )}
                     </div>
                   </div>

                                     <div className="space-y-0.5 sm:space-y-1">
                     {/* Reservas de salas de reuniones - mostrar detalles */}
                     {dayBookings.slice(0, 1).map((booking) => (
                       <div
                         key={booking.id}
                         className="p-0.5 sm:p-1 rounded text-xs"
                         style={{
                           backgroundColor: getRoomColor(booking.meetingRoomId) + '20',
                           borderLeft: `2px solid ${getRoomColor(booking.meetingRoomId)}`,
                         }}
                       >
                         <div className="flex justify-between items-start">
                           <div className="flex-1 min-w-0">
                             <p className="font-medium truncate text-xs" title={booking.title}>
                               {booking.title}
                             </p>
                             <p className="text-xs text-muted-foreground truncate hidden sm:block">
                               {booking.meetingRoom.name}
                             </p>
                             <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                               <Clock className="w-2 h-2" />
                               <span className="text-xs">
                                 {formatTime(booking.startTime)}
                               </span>
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                     
                     {/* Asistencia - mostrar barra de progreso */}
                     {dayAttendanceReservations.length > 0 && (
                       <div className="space-y-0.5 sm:space-y-1">
                         <div className="flex justify-between items-center text-xs">
                           <span className="text-muted-foreground hidden sm:inline">Asistencia</span>
                           <span className="font-medium text-xs">
                             {dayAttendanceReservations.length}/{maxSpotsPerDay}
                           </span>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                           <div
                             className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                             style={{
                               width: `${Math.min((dayAttendanceReservations.length / maxSpotsPerDay) * 100, 100)}%`
                             }}
                           />
                         </div>
                       </div>
                     )}
                   </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card className="mt-4 sm:mt-6">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Leyenda</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Leyenda de salas */}
            <div className="col-span-full">
              <h4 className="text-sm font-medium mb-2">Salas de Reuniones</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                {meetingRooms.filter(room => room.isActive).map((room, index) => (
                  <div key={room.id} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded"
                      style={{ backgroundColor: getRoomColor(room.id) }}
                    />
                    <span className="text-xs sm:text-sm font-medium">{room.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Leyenda de asistencia */}
            <div className="col-span-full mt-3 sm:mt-4">
              <h4 className="text-sm font-medium mb-2">Asistencia</h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-50 border-l-2 border-green-500"></div>
                <span className="text-xs sm:text-sm font-medium">Reservas de Asistencia</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para ver detalles */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Detalles del {selectedDate && formatDate(new Date(selectedDate))}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6">
            {/* Reservas de salas */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Reservas de Salas</h3>
              {selectedDate && getBookingsForDate(new Date(selectedDate)).length === 0 ? (
                <p className="text-muted-foreground text-sm">No hay reservas de salas para este día</p>
              ) : (
                <div className="space-y-2">
                  {selectedDate && getBookingsForDate(new Date(selectedDate)).map((booking) => (
                    <div
                      key={booking.id}
                      className="p-2 sm:p-3 rounded-lg border"
                      style={{
                        backgroundColor: getRoomColor(booking.meetingRoomId) + '10',
                        borderLeft: `4px solid ${getRoomColor(booking.meetingRoomId)}`,
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base">{booking.title}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">{booking.meetingRoom.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm">
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Reservado por: {booking.user.name}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive flex-shrink-0"
                          onClick={() => handleDeleteBooking(booking.id)}
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reservas de asistencia */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Asistencia</h3>
              {selectedDate && getAttendanceReservationsForDate(new Date(selectedDate)).length === 0 ? (
                <p className="text-muted-foreground text-sm">No hay reservas de asistencia para este día</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium">Ocupación</span>
                    <span className="text-xs sm:text-sm">
                      {selectedDate && getAttendanceReservationsForDate(new Date(selectedDate)).length}/{maxSpotsPerDay}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                    <div
                      className="bg-green-500 h-2 sm:h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((selectedDate && getAttendanceReservationsForDate(new Date(selectedDate)).length || 0) / maxSpotsPerDay * 100, 100)}%`
                      }}
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    {selectedDate && getAttendanceReservationsForDate(new Date(selectedDate)).map((reservation) => (
                      <div key={reservation.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs sm:text-sm">{reservation.user.name}</p>
                          {reservation.team && (
                            <p className="text-xs text-muted-foreground">{reservation.team.name}</p>
                          )}
                        </div>
                        {reservation.userId === session?.user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive flex-shrink-0"
                            onClick={() => handleDeleteAttendance(reservation.id)}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 sm:mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
              className="w-full sm:w-auto"
            >
              Cerrar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowDetailsDialog(false)
                setShowAttendanceDialog(true)
              }}
              disabled={selectedDate ? hasUserReservationForDate(new Date(selectedDate)) : false}
              className="w-full sm:w-auto"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="hidden sm:inline">
                {selectedDate && hasUserReservationForDate(new Date(selectedDate)) 
                  ? 'Ya tienes reserva' 
                  : 'Registrar Asistencia'
                }
              </span>
              <span className="sm:hidden">
                {selectedDate && hasUserReservationForDate(new Date(selectedDate)) 
                  ? 'Reservado' 
                  : 'Asistencia'
                }
              </span>
            </Button>
            <Button
              onClick={() => {
                setShowDetailsDialog(false)
                setShowCreateDialog(true)
              }}
              className="w-full sm:w-auto"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Nueva Reserva
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear reserva */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold">Nueva Reserva</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleCreateBooking(new FormData(e.currentTarget))
          }}>
            <div className="grid gap-4 sm:gap-6 py-4">
              <div className="grid gap-2 sm:gap-3">
                <label htmlFor="title" className="text-sm font-medium">
                  Título de la reunión
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="flex h-10 sm:h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div className="grid gap-2 sm:gap-3">
                <label htmlFor="description" className="text-sm font-medium">
                  Descripción (opcional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="flex min-h-[80px] sm:min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid gap-2 sm:gap-3">
                <label htmlFor="meetingRoom" className="text-sm font-medium">
                  Sala de reuniones
                </label>
                <select
                  id="meetingRoom"
                  name="meetingRoom"
                  required
                  className="flex h-10 sm:h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="grid gap-2 sm:gap-3">
                  <label htmlFor="startTime" className="text-sm font-medium">
                    Inicio
                  </label>
                  <input
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    required
                    defaultValue={selectedDate ? `${selectedDate}T09:00` : ''}
                    className="flex h-10 sm:h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                
                <div className="grid gap-2 sm:gap-3">
                  <label htmlFor="endTime" className="text-sm font-medium">
                    Fin
                  </label>
                  <input
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    required
                    defaultValue={selectedDate ? `${selectedDate}T10:00` : ''}
                    className="flex h-10 sm:h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="w-full sm:w-auto h-10 sm:h-12 text-sm font-medium"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto h-10 sm:h-12 text-sm font-medium">
                Crear Reserva
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para registrar asistencia */}
      <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold">Registrar Asistencia</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleCreateAttendance(new FormData(e.currentTarget))
          }}>
            <div className="grid gap-4 sm:gap-6 py-4">
              <div className="grid gap-2 sm:gap-3">
                <label htmlFor="date" className="text-sm font-medium">
                  Fecha
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={selectedDate || ''}
                  disabled
                  className="flex h-10 sm:h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="bg-blue-50 p-3 sm:p-4 rounded-md">
                <p className="text-sm sm:text-base text-blue-700">
                  <strong>Información:</strong> Se registrará tu asistencia para el día {selectedDate && formatDate(new Date(selectedDate))}.
                  {session?.user?.teamId && (
                    <span className="block mt-2">Tu equipo se asignará automáticamente.</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAttendanceDialog(false)}
                className="w-full sm:w-auto h-10 sm:h-12 text-sm font-medium"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto h-10 sm:h-12 text-sm font-medium">
                Registrar Asistencia
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 