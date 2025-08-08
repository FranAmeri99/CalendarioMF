'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Business,
} from '@mui/icons-material'

interface Team {
  id: string
  name: string
  description?: string
  leaderId?: string
  attendanceDay?: number
  leader?: {
    id: string
    name: string
    email: string
  }
  members?: {
    id: string
    name: string
    email: string
  }[]
}

interface User {
  id: string
  name: string
  email: string
  role: string
  teamId?: string
}

interface FormData {
  name: string
  description: string
  leaderId: string
  attendanceDay: string
}

export default function TeamsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    leaderId: '',
    attendanceDay: '',
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Obtener equipos y usuarios en paralelo
      const [teamsResponse, usersResponse] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/users')
      ])
      
      if (!teamsResponse.ok) {
        throw new Error(`HTTP error! status: ${teamsResponse.status}`)
      }
      
      if (!usersResponse.ok) {
        throw new Error(`HTTP error! status: ${usersResponse.status}`)
      }
      
      const teamsData = await teamsResponse.json()
      const usersData = await usersResponse.json()
      
      if (teamsData.error) {
        throw new Error(teamsData.error)
      }
      
      if (usersData.error) {
        throw new Error(usersData.error)
      }

      console.log('Teams data:', teamsData)
      console.log('Users data:', usersData)

      // La API de equipos devuelve directamente el array
      setTeams(teamsData)
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, fetchData])

  const handleOpenDialog = (team?: Team) => {
    if (team) {
      setEditingTeam(team)
      setFormData({
        name: team.name,
        description: team.description || '',
        leaderId: team.leaderId || '',
        attendanceDay: team.attendanceDay?.toString() || '',
      })
    } else {
      setEditingTeam(null)
      setFormData({
        name: '',
        description: '',
        leaderId: '',
        attendanceDay: '',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingTeam(null)
    setFormData({
      name: '',
      description: '',
      leaderId: '',
      attendanceDay: '',
    })
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        alert('Debe ingresar un nombre para el equipo')
        return
      }

      const url = '/api/teams'
      const method = editingTeam ? 'PUT' : 'POST'
      
      const body = editingTeam 
        ? {
            id: editingTeam.id,
            name: formData.name,
            description: formData.description,
            leaderId: formData.leaderId || undefined,
            attendanceDay: formData.attendanceDay ? parseInt(formData.attendanceDay) : undefined,
          }
        : {
            name: formData.name,
            description: formData.description,
            leaderId: formData.leaderId || undefined,
            attendanceDay: formData.attendanceDay ? parseInt(formData.attendanceDay) : undefined,
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

      alert(editingTeam ? 'Equipo actualizado exitosamente' : 'Equipo creado exitosamente')
      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error('Error saving team:', error)
      alert('Error al guardar el equipo')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este equipo?')) {
      return
    }

    try {
      const response = await fetch(`/api/teams?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      alert('Equipo eliminado exitosamente')
      fetchData()
    } catch (error) {
      console.error('Error deleting team:', error)
      alert('Error al eliminar el equipo')
    }
  }

  const getDayName = (day: number) => {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    return days[day] || 'Sin asignar'
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
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        mb={{ xs: '24px', sm: '32px' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 0 }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            color: '#1a1a1a',
            fontSize: { xs: '24px', sm: '28px', md: '32px' },
            lineHeight: { xs: '32px', sm: '36px', md: '40px' }
          }}
        >
          Gestión de Equipos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: { xs: '8px', sm: '12px' },
            textTransform: 'none',
            fontWeight: 600,
            px: { xs: '16px', sm: '24px' },
            py: { xs: '10px', sm: '12px' },
            fontSize: { xs: '13px', sm: '14px' },
            lineHeight: { xs: '18px', sm: '20px' },
            bgcolor: '#1976d2',
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              bgcolor: '#1565c0'
            }
          }}
        >
          Nuevo Equipo
        </Button>
      </Box>

      <Paper
        sx={{
          background: '#ffffff',
          border: '1px solid #e8e8e8',
          borderRadius: { xs: '12px', sm: '16px' },
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}
      >
        <TableContainer sx={{ 
          '& .MuiTable-root': {
            minWidth: { xs: 650, sm: 800 }
          }
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#1a1a1a',
                  fontSize: { xs: '12px', sm: '14px' },
                  padding: { xs: '8px 4px', sm: '16px' }
                }}>
                  Equipo
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#1a1a1a',
                  fontSize: { xs: '12px', sm: '14px' },
                  padding: { xs: '8px 4px', sm: '16px' },
                  display: { xs: 'none', md: 'table-cell' }
                }}>
                  Descripción
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#1a1a1a',
                  fontSize: { xs: '12px', sm: '14px' },
                  padding: { xs: '8px 4px', sm: '16px' }
                }}>
                  Líder
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#1a1a1a',
                  fontSize: { xs: '12px', sm: '14px' },
                  padding: { xs: '8px 4px', sm: '16px' },
                  display: { xs: 'none', lg: 'table-cell' }
                }}>
                  Miembros
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#1a1a1a',
                  fontSize: { xs: '12px', sm: '14px' },
                  padding: { xs: '8px 4px', sm: '16px' }
                }}>
                  Día de Asistencia
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#1a1a1a',
                  fontSize: { xs: '12px', sm: '14px' },
                  padding: { xs: '8px 4px', sm: '16px' }
                }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams && teams.length > 0 ? (
                teams.map((team) => (
                  <TableRow key={team.id} hover>
                    <TableCell sx={{ padding: { xs: '8px 4px', sm: '16px' } }}>
                      <Box display="flex" alignItems="center" gap={{ xs: '8px', sm: '12px' }}>
                        <Box
                          sx={{
                            width: { xs: 32, sm: 40 },
                            height: { xs: 32, sm: 40 },
                            borderRadius: '50%',
                            bgcolor: '#9c27b0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: { xs: '14px', sm: '16px' }
                          }}
                        >
                          <Business sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        </Box>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: { xs: '13px', sm: '16px' }
                          }}
                        >
                          {team.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ 
                      padding: { xs: '8px 4px', sm: '16px' },
                      display: { xs: 'none', md: 'table-cell' }
                    }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '11px', sm: '14px' } }}
                      >
                        {team.description || 'Sin descripción'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ padding: { xs: '8px 4px', sm: '16px' } }}>
                      {team.leader ? (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            fontSize: { xs: '11px', sm: '14px' }
                          }}
                        >
                          {team.leader.name}
                        </Typography>
                      ) : (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '11px', sm: '14px' } }}
                        >
                          Sin líder asignado
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ 
                      padding: { xs: '8px 4px', sm: '16px' },
                      display: { xs: 'none', lg: 'table-cell' }
                    }}>
                      {team.members && team.members.length > 0 ? (
                        <Box display="flex" gap="4px" flexWrap="wrap">
                          {team.members.slice(0, 3).map((member) => (
                            <Chip
                              key={member.id}
                              label={member.name}
                              size="small"
                              sx={{
                                bgcolor: '#e3f2fd',
                                color: '#1976d2',
                                fontSize: { xs: '9px', sm: '10px' },
                                height: { xs: '18px', sm: '20px' }
                              }}
                            />
                          ))}
                          {team.members.length > 3 && (
                            <Chip
                              label={`+${team.members.length - 3}`}
                              size="small"
                              sx={{
                                bgcolor: '#f5f5f5',
                                color: '#666',
                                fontSize: { xs: '9px', sm: '10px' },
                                height: { xs: '18px', sm: '20px' }
                              }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '11px', sm: '14px' } }}
                        >
                          Sin miembros
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ padding: { xs: '8px 4px', sm: '16px' } }}>
                      {team.attendanceDay !== undefined && team.attendanceDay !== null ? (
                        <Chip
                          label={getDayName(team.attendanceDay)}
                          size="small"
                          sx={{
                            bgcolor: '#e8f5e8',
                            color: '#2e7d32',
                            fontSize: { xs: '10px', sm: '12px' },
                            height: { xs: '20px', sm: '24px' }
                          }}
                        />
                      ) : (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '11px', sm: '14px' } }}
                        >
                          Sin asignar
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ padding: { xs: '8px 4px', sm: '16px' } }}>
                      <Box display="flex" gap={{ xs: '4px', sm: '8px' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(team)}
                          sx={{ 
                            color: '#1976d2',
                            padding: { xs: '4px', sm: '8px' }
                          }}
                        >
                          <EditIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(team.id)}
                          sx={{ 
                            color: '#d32f2f',
                            padding: { xs: '4px', sm: '8px' }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ padding: '32px' }}>
                    <Typography variant="body2" color="text.secondary">
                      {loading ? 'Cargando equipos...' : 'No hay equipos disponibles'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para crear/editar equipo */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: '12px', sm: '16px' },
            margin: { xs: '16px', sm: '32px' }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '18px', sm: '20px' },
          padding: { xs: '20px 24px 0', sm: '24px 24px 0' }
        }}>
          {editingTeam ? 'Editar Equipo' : 'Nuevo Equipo'}
        </DialogTitle>
        <DialogContent sx={{ padding: { xs: '16px 24px', sm: '20px 24px' } }}>
          <Box display="flex" flexDirection="column" gap={{ xs: '12px', sm: '16px' }} mt="8px">
            <TextField
              label="Nombre del equipo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              size="small"
              required
              sx={{
                '& .MuiInputBase-root': {
                  height: { xs: '48px', sm: '56px' }
                }
              }}
            />

            <TextField
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              size="small"
              multiline
              rows={3}
              sx={{
                '& .MuiInputBase-root': {
                  minHeight: { xs: '80px', sm: '100px' }
                }
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Líder del equipo (opcional)</InputLabel>
              <Select
                value={formData.leaderId}
                onChange={(e) => setFormData({ ...formData, leaderId: e.target.value })}
                label="Líder del equipo (opcional)"
                sx={{
                  '& .MuiInputBase-root': {
                    height: { xs: '48px', sm: '56px' }
                  }
                }}
              >
                <MenuItem value="">
                  <em>Sin líder asignado</em>
                </MenuItem>
                {users && users.length > 0 ? users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </MenuItem>
                )) : (
                  <MenuItem disabled>
                    No hay usuarios disponibles
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Día de asistencia semanal</InputLabel>
              <Select
                value={formData.attendanceDay}
                onChange={(e) => setFormData({ ...formData, attendanceDay: e.target.value })}
                label="Día de asistencia semanal"
                sx={{
                  '& .MuiInputBase-root': {
                    height: { xs: '48px', sm: '56px' }
                  }
                }}
              >
                <MenuItem value="">
                  <em>Sin día asignado</em>
                </MenuItem>
                <MenuItem value="0">Lunes</MenuItem>
                <MenuItem value="1">Martes</MenuItem>
                <MenuItem value="2">Miércoles</MenuItem>
                <MenuItem value="3">Jueves</MenuItem>
                <MenuItem value="4">Viernes</MenuItem>
                <MenuItem value="5">Sábado</MenuItem>
                <MenuItem value="6">Domingo</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          padding: { xs: '16px 24px 20px', sm: '20px 24px 24px' },
          gap: { xs: '8px', sm: '12px' }
        }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{
              fontSize: { xs: '13px', sm: '14px' },
              padding: { xs: '8px 16px', sm: '10px 20px' }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{
              fontSize: { xs: '13px', sm: '14px' },
              padding: { xs: '8px 16px', sm: '10px 20px' }
            }}
          >
            {editingTeam ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
} 