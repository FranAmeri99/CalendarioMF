import { NextRequest, NextResponse } from 'next/server'
import { MeetingRoomService } from '@/lib/services/meetingRoomService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const meetingRoom = await MeetingRoomService.getMeetingRoomById(id)
      if (!meetingRoom) {
        return NextResponse.json(
          { error: 'Sala de reuniones no encontrada' },
          { status: 404 }
        )
      }
      return NextResponse.json(meetingRoom)
    }

    const meetingRooms = await MeetingRoomService.getAllMeetingRooms()
    return NextResponse.json(meetingRooms)
  } catch (error) {
    console.error('Error fetching meeting rooms:', error)
    return NextResponse.json(
      { error: 'Error al obtener salas de reuniones' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, capacity, isActive } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre de la sala es requerido' },
        { status: 400 }
      )
    }

    const meetingRoom = await MeetingRoomService.createMeetingRoom({
      name,
      description,
      capacity: capacity || 10,
      isActive: isActive !== undefined ? isActive : true,
    })

    return NextResponse.json({ meetingRoom })
  } catch (error) {
    console.error('Error creating meeting room:', error)
    return NextResponse.json(
      { error: 'Error al crear sala de reuniones' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, capacity, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la sala es requerido' },
        { status: 400 }
      )
    }

    const meetingRoom = await MeetingRoomService.updateMeetingRoom(id, {
      name,
      description,
      capacity,
      isActive,
    })

    return NextResponse.json({ meetingRoom })
  } catch (error) {
    console.error('Error updating meeting room:', error)
    return NextResponse.json(
      { error: 'Error al actualizar sala de reuniones' },
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
        { error: 'ID de la sala es requerido' },
        { status: 400 }
      )
    }

    await MeetingRoomService.deleteMeetingRoom(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting meeting room:', error)
    return NextResponse.json(
      { error: 'Error al eliminar sala de reuniones' },
      { status: 500 }
    )
  }
} 