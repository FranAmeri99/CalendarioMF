'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ChevronLeft, ChevronRight, Plus, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Reservation {
  id: string;
  date: string;
  userId: string;
  teamId?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  user: {
    id: string;
    name: string;
    email: string;
  };
  team?: {
    id: string;
    name: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  teamId?: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface CalendarViewProps {
  reservations: Reservation[];
  users: User[];
  teams: Team[];
  currentUser: User | null;
  maxSpots?: number;
  onCreateReservation?: (date: string) => Promise<void>;
  onCancelReservation?: (reservationId: string) => Promise<void>;
}

export function ModernCalendarView({
  reservations,
  users,
  teams,
  currentUser,
  maxSpots = 12,
  onCreateReservation,
  onCancelReservation,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      days.push(dayDate);
    }
    
    return days;
  };

  const getDayReservations = (dateStr: string) => {
    // Convertir la fecha de la reserva a zona horaria local para comparar correctamente
    const filtered = reservations.filter((r) => {
      const reservationDate = new Date(r.date);
      const reservationDateStr = reservationDate.toLocaleDateString('en-CA'); // YYYY-MM-DD en zona horaria local
      return reservationDateStr === dateStr;
    });
    
    return filtered;
  };

  const getDayOccupancy = (dateStr: string) => {
    const dayReservations = getDayReservations(dateStr);
    return {
      availableSpots: maxSpots - dayReservations.length,
      reservations: dayReservations,
    };
  };

  const handleReservation = async (date: string) => {
    if (!currentUser || !onCreateReservation) return;
    
    try {
      await onCreateReservation(date);
      toast.success('Reserva creada exitosamente');
      setSelectedDate(null);
    } catch (error) {
      const dayOccupancy = getDayOccupancy(date);
      if (dayOccupancy.availableSpots === 0) {
        toast.error('No hay lugares disponibles para esta fecha');
      } else {
        toast.error('Ya tienes una reserva para esta fecha');
      }
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!onCancelReservation) return;
    
    try {
      await onCancelReservation(reservationId);
      toast.success('Reserva cancelada exitosamente');
    } catch (error) {
      toast.error('Error al cancelar la reserva');
    }
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date().toLocaleDateString('en-CA'); // Formato YYYY-MM-DD en zona horaria local
  const monthYear = currentDate.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  });

  const getTeamColor = (teamId: string | null) => {
    if (!teamId) return '#6b7280';
    const team = teams.find(t => t.id === teamId);
    return team?.color || '#6b7280';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Calendario</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium capitalize min-w-[200px] text-center">
            {monthYear}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="p-2 h-24" />;
              }

              const dateStr = day.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD en zona horaria local
              const dayOccupancy = getDayOccupancy(dateStr);
              const isToday = dateStr === today;
              const isPast = dateStr < today;
              const occupancyRate = ((maxSpots - dayOccupancy.availableSpots) / maxSpots) * 100;

              return (
                <Dialog key={dateStr}>
                  <DialogTrigger asChild>
                    <div 
                      className={`p-2 h-24 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                        isToday ? 'border-primary bg-primary/5' : ''
                      } ${isPast ? 'opacity-50' : ''}`}
                      onClick={() => setSelectedDate(dateStr)}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isToday ? 'font-bold text-primary' : ''}`}>
                            {day.getDate()}
                          </span>
                          <Badge 
                            variant={dayOccupancy.availableSpots === 0 ? 'destructive' : 'secondary'}
                            className="text-xs px-1"
                          >
                            {maxSpots - dayOccupancy.availableSpots}/{maxSpots}
                          </Badge>
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-end">
                          <div className="w-full bg-muted rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full transition-all ${
                                occupancyRate > 80 ? 'bg-destructive' : 
                                occupancyRate > 50 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${occupancyRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {day.toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Ocupación</p>
                            <p className="text-sm text-muted-foreground">
                              {maxSpots - dayOccupancy.availableSpots} de {maxSpots} lugares ocupados
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={dayOccupancy.availableSpots === 0 ? 'destructive' : 'secondary'}
                        >
                          {dayOccupancy.availableSpots} disponibles
                        </Badge>
                      </div>

                      {!isPast && dayOccupancy.availableSpots > 0 && currentUser && (
                        <Button 
                          onClick={() => handleReservation(dateStr)}
                          className="w-full"
                          disabled={dayOccupancy.reservations.some(r => r.userId === currentUser.id && r.status === 'confirmed')}
                        >
                          {dayOccupancy.reservations.some(r => r.userId === currentUser.id && r.status === 'confirmed') 
                            ? 'Ya tienes una reserva' 
                            : 'Hacer Reserva'
                          }
                        </Button>
                      )}

                      {dayOccupancy.reservations.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Reservas del día</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {dayOccupancy.reservations.map((reservation) => {
                              const employee = users.find(e => e.id === reservation.userId);
                              const team = employee?.teamId ? teams.find(t => t.id === employee.teamId) : null;
                              const isCurrentUser = employee?.id === currentUser?.id;
                              
                              return (
                                <div key={reservation.id} className="flex items-center justify-between p-2 bg-card border rounded">
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback style={{ backgroundColor: getTeamColor(employee?.teamId || null) + '20' }}>
                                        {employee?.name.split(' ').map(n => n[0]).join('') || '?'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {employee?.name || 'Usuario desconocido'}
                                      </p>
                                      {team && (
                                        <p className="text-xs text-muted-foreground">
                                          {team.name}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {isCurrentUser && !isPast && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCancelReservation(reservation.id)}
                                    >
                                      Cancelar
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 