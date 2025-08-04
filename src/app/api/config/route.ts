import { NextRequest, NextResponse } from 'next/server'
import { ConfigService } from '@/lib/services/configService'

export async function GET() {
  try {
    const config = await ConfigService.getConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching config:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const config = await ConfigService.updateConfig(data)
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating config:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
} 