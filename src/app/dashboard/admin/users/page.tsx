'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person,
} from '@mui/icons-material'

interface User {
  id: string
  name: string
  email: string
  role: string
  teamId?: string
  team?: {
    id: string
    name: string
  }
}

interface Team {
  id: string
  name: string
  description?: string
}

interface FormData {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
  teamId: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    teamId: '',
  })

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
      const response = await fetch('/api/users')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setUsers(data.users)
      setTeams(data.teams)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role as 'ADMIN' | 'MANAGER' | 'USER',
        teamId: user.teamId || '',
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        teamId: '',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'USER',
      teamId: '',
    })
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.email) {
        alert('Debe completar todos los campos obligatorios')
        return
      }
      if (!editingUser && !formData.password) {
        alert('Debe ingresar una contraseña para nuevos usuarios')
        return
      }

      const url = '/api/users'
      const method = editingUser ? 'PUT' : 'POST'
      
      const body = editingUser 
        ? {
            id: editingUser.id,
            name: formData.name,
            email: formData.email,
            password: formData.password || undefined,
            role: formData.role,
            teamId: formData.teamId || undefined,
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            teamId: formData.teamId || undefined,
          }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      alert(editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente')
      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Error al guardar el usuario')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) {
      return
    }

    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      alert('Usuario eliminado exitosamente')
      fetchData()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error al eliminar el usuario')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '#d32f2f'
      case 'MANAGER':
        return '#f57c00'
      default:
        return '#1976d2'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador'
      case 'MANAGER':
        return 'Manager'
      default:
        return 'Usuario'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!session) {
    return null
  }

  return (
    <Container maxWidth="xl" sx={{ p: 0 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="32px">
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            color: '#1a1a1a',
            fontSize: '32px',
            lineHeight: '40px'
          }}
        >
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: '24px',
            py: '12px',
            fontSize: '14px',
            lineHeight: '20px',
            bgcolor: '#1976d2',
            '&:hover': {
              bgcolor: '#1565c0'
            }
          }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Paper
        sx={{
          background: '#ffffff',
          border: '1px solid #e8e8e8',
          borderRadius: '16px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Equipo</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap="12px">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: '#1976d2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '16px'
                        }}
                      >
                        {user.name.charAt(0)}
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {user.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      size="small"
                      sx={{
                        bgcolor: getRoleColor(user.role),
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '11px'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {user.team ? (
                      <Chip
                        label={user.team.name}
                        size="small"
                        sx={{
                          bgcolor: '#e3f2fd',
                          color: '#1976d2',
                          fontWeight: 600
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin equipo
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap="8px">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(user)}
                        sx={{ color: '#1976d2' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(user.id)}
                        sx={{ color: '#d32f2f' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para crear/editar usuario */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap="16px" mt="8px">
            <TextField
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              size="small"
              required
            />

            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              size="small"
              required
            />

            <TextField
              label={editingUser ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              size="small"
              required={!editingUser}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'MANAGER' | 'USER' })}
                label="Rol"
              >
                <MenuItem value="USER">Usuario</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="ADMIN">Administrador</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Equipo (opcional)</InputLabel>
              <Select
                value={formData.teamId}
                onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                label="Equipo (opcional)"
              >
                <MenuItem value="">
                  <em>Sin equipo</em>
                </MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
} 