import { NextRequest, NextResponse } from 'next/server'
import { MeetingRoomService } from '@/lib/services/meetingRoomService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const meetingRoomId = searchParams.get('meetingRoomId')

    if (userId) {
      const bookings = await MeetingRoomService.getBookingsByUser(userId)
      return NextResponse.json(bookings)
    }

    if (meetingRoomId) {
      const bookings = await MeetingRoomService.getBookingsByMeetingRoom(meetingRoomId)
      return NextResponse.json(bookings)
    }

    const bookings = await MeetingRoomService.getAllBookings()
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Error al obtener reservas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, startTime, endTime, userId, meetingRoomId } = body

    if (!title || !startTime || !endTime || !userId || !meetingRoomId) {
      return NextResponse.json(
        { error: 'Título, horarios, usuario y sala son requeridos' },
        { status: 400 }
      )
    }

    // Validar que la fecha de inicio sea anterior a la de fin
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    if (start >= end) {
      return NextResponse.json(
        { error: 'La fecha de inicio debe ser anterior a la fecha de fin' },
        { status: 400 }
      )
    }

    // Validar que no sea en el pasado
    if (start < new Date()) {
      return NextResponse.json(
        { error: 'No se pueden crear reservas en el pasado' },
        { status: 400 }
      )
    }

    const booking = await MeetingRoomService.createBooking({
      title,
      description,
      startTime: start,
      endTime: end,
      userId,
      meetingRoomId,
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear reserva' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, description, startTime, endTime, userId, meetingRoomId } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la reserva es requerido' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (startTime) updateData.startTime = new Date(startTime)
    if (endTime) updateData.endTime = new Date(endTime)
    if (userId) updateData.userId = userId
    if (meetingRoomId) updateData.meetingRoomId = meetingRoomId

    const booking = await MeetingRoomService.updateBooking(id, updateData)
    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Error al actualizar reserva' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la reserva es requerido' },
        { status: 400 }
      )
    }

    await MeetingRoomService.deleteBooking(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Error al eliminar reserva' },
      { status: 500 }
    )
  }
} 