import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Asistencia y Reservas',
  description: 'Aplicación completa para gestionar la asistencia física a la oficina y reservas de salas de reuniones',
  keywords: ['asistencia', 'reservas', 'oficina', 'calendario', 'equipos'],
  authors: [{ name: 'Sistema de Gestión' }],
  creator: 'Sistema de Gestión',
  publisher: 'Sistema de Gestión',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Sistema de Asistencia y Reservas',
    description: 'Aplicación completa para gestionar la asistencia física a la oficina y reservas de salas de reuniones',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistema de Asistencia y Reservas',
    description: 'Aplicación completa para gestionar la asistencia física a la oficina y reservas de salas de reuniones',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 