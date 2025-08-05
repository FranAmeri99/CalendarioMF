'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
} from '@mui/material'
import { LockOutlined } from '@mui/icons-material'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  if (session) {
    router.push('/dashboard')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Credenciales inválidas')
      } else {
        toast.success('Inicio de sesión exitoso')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={{ xs: 2, sm: 3 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: { xs: '100%', sm: 400 },
            borderRadius: { xs: '12px', sm: '16px' },
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" gap={{ xs: 1.5, sm: 2 }}>
            <LockOutlined sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main' }} />
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '2.125rem' },
                textAlign: 'center'
              }}
            >
              Iniciar Sesión
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              textAlign="center"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Sistema de Gestión de Asistencia
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: { xs: 2, sm: 3 } }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
              sx={{
                '& .MuiInputBase-root': {
                  height: { xs: '48px', sm: '56px' }
                }
              }}
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              sx={{
                '& .MuiInputBase-root': {
                  height: { xs: '48px', sm: '56px' }
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: { xs: 2, sm: 3 }, 
                mb: 2,
                height: { xs: '48px', sm: '56px' },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
} 